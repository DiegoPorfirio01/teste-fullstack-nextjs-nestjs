'use server';

import { revalidatePath } from 'next/cache';
import { routes } from '@/api-routes';
import { getProfileCached } from '@/actions/profile';
import { getApiErrorMessage } from '@/lib/api-error';
import {
  rethrowNavigationError,
  toUserFriendlyMessage,
} from '@/lib/action-utils';
import { serverFetch } from '@/lib/server-fetch';
import { extractList } from '@/lib/api-response';
import {
  logActionStart,
  logActionSuccess,
  logActionError,
} from '@/lib/action-logger';
import { EMAIL_REGEX, MAX_AMOUNT, REVERT_WINDOW_MS } from '@/constants';
import {
  TransactionDirection,
  TransactionStatus,
  TransactionType,
} from '@/enums';
import type {
  ITransaction,
  ActionResult,
  ReverseState,
  TransactionByPeriodItem,
  TransferState,
} from '@/types';

/** Formato bruto da API (NestJS Transaction) */
interface RawTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  senderId: string;
  receiverId?: string | null;
  sender?: { email?: string } | null;
  receiver?: { email?: string } | null;
  status: TransactionStatus;
  createdAt: Date | string;
  direction: string;
  canReverse: boolean;
  counterpartEmail?: string;
}

function resolveDirection(
  raw: RawTransaction,
  userId: string,
): ITransaction['direction'] {
  const hasExplicit =
    raw.direction === TransactionDirection.SENT ||
    raw.direction === TransactionDirection.RECEIVED;
  if (hasExplicit) return raw.direction as ITransaction['direction'];

  const isSent = raw.senderId === userId;
  return isSent ? TransactionDirection.SENT : TransactionDirection.RECEIVED;
}

function resolveCanReverse(raw: RawTransaction, userId: string): boolean {
  if (typeof raw.canReverse === 'boolean') return raw.canReverse;

  const createdTime = new Date(raw.createdAt).getTime();

  const elapsed = Date.now() - createdTime;
  const withinWindow = elapsed <= REVERT_WINDOW_MS;

  return (
    raw.type === TransactionType.TRANSFER &&
    raw.status === TransactionStatus.COMPLETED &&
    raw.senderId === userId &&
    withinWindow
  );
}

function resolveCounterpartEmail(raw: RawTransaction): string | undefined {
  const fromField = raw.counterpartEmail;
  if (fromField) return fromField;

  const direction = raw.direction as string | undefined;
  const nested =
    direction === TransactionDirection.SENT
      ? raw.receiver?.email
      : raw.sender?.email;
  return nested ?? undefined;
}

function mapRawToTransaction(
  raw: RawTransaction,
  userId: string,
): ITransaction {
  return {
    id: raw.id,
    type: raw.type,
    amount: raw.amount,
    senderId: raw.senderId ?? undefined,
    receiverId: raw.receiverId ?? undefined,
    status: raw.status,
    // Armazena como ISO (com hora) para permitir cálculos (10min) no frontend.
    createdAt: new Date(raw.createdAt).toISOString(),
    direction: resolveDirection(raw, userId),
    canReverse: resolveCanReverse(raw, userId),
    counterpartEmail: resolveCounterpartEmail(raw),
  };
}

// ---- Actions (mutations) ----

export async function transferAction(
  _prevState: TransferState | undefined,
  formData: FormData,
): Promise<TransferState> {
  const receiverEmail = (formData.get('receiverEmail') as string)?.trim();
  const amountStr = formData.get('amount') as string;
  const amount = parseFloat(amountStr ?? '0');

  if (!receiverEmail) {
    return {
      fieldErrors: { receiverEmail: ['Informe o e-mail do destinatário'] },
    };
  }
  if (!EMAIL_REGEX.test(receiverEmail)) {
    return {
      fieldErrors: { receiverEmail: ['E-mail do destinatário inválido'] },
      receiverEmail,
      amount,
    };
  }
  if (!amount || amount <= 0) {
    return {
      fieldErrors: { amount: ['Informe um valor válido'] },
      receiverEmail,
      amount,
    };
  }
  if (amount > MAX_AMOUNT) {
    return {
      fieldErrors: {
        amount: [
          `Valor máximo permitido é R$ ${MAX_AMOUNT.toLocaleString('pt-BR')}`,
        ],
      },
      receiverEmail,
      amount,
    };
  }

  logActionStart('transferAction', { receiverEmail, amount });

  try {
    const res = await serverFetch(routes.transactions.transfer, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverEmail, amount }),
    });

    const data = (await res.json()) as Record<string, unknown>;
    if (!res.ok) {
      const msg = getApiErrorMessage(data, 'Falha ao transferir');
      return { error: msg, receiverEmail, amount };
    }

    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    logActionSuccess('transferAction', { receiverEmail, amount });
    return { success: true };
  } catch (err) {
    rethrowNavigationError(err);
    logActionError('transferAction', err, { receiverEmail, amount });
    return {
      error: toUserFriendlyMessage(err, 'Erro inesperado ao transferir'),
      receiverEmail,
      amount,
    };
  }
}

export async function reverseAction(
  _prevState: ReverseState | undefined,
  formData: FormData,
): Promise<ReverseState> {
  const transactionId = (formData.get('transactionId') as string)?.trim();
  if (!transactionId) {
    return { error: 'ID da transação inválido' };
  }

  logActionStart('reverseAction', { transactionId });

  try {
    const res = await serverFetch(routes.transactions.reverse(transactionId), {
      method: 'POST',
    });

    const data = (await res.json()) as Record<string, unknown>;
    if (!res.ok) {
      const msg = getApiErrorMessage(data, 'Falha ao reverter transação');
      return { error: msg, transactionId };
    }

    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    logActionSuccess('reverseAction', { transactionId });
    return { success: true, transactionId };
  } catch (err) {
    rethrowNavigationError(err);
    logActionError('reverseAction', err, { transactionId });
    return {
      error: toUserFriendlyMessage(err, 'Erro inesperado ao reverter'),
      transactionId,
    };
  }
}

// ---- Actions (reads) ----

export async function getTransactionsByPeriod(
  days: 7 | 30 | 90,
): Promise<ActionResult<TransactionByPeriodItem[]>> {
  logActionStart('getTransactionsByPeriod', { days });

  try {
    const res = await serverFetch(routes.transactions.byPeriod(days));
    if (!res.ok) {
      const data = (await res.json()) as Record<string, unknown>;
      const msg = getApiErrorMessage(
        data,
        'Falha ao carregar dados do gráfico',
      );
      return { error: msg };
    }

    const data = (await res.json()) as unknown;
    const list = extractList<Record<string, unknown>>(data);

    const items: TransactionByPeriodItem[] = list.map((item) => ({
      date: String(item.date ?? ''),
      recebido: Number(item.recebido ?? 0),
      enviado: Number(item.enviado ?? 0),
    }));

    return { data: items };
  } catch (err) {
    rethrowNavigationError(err);
    logActionError('getTransactionsByPeriod', err, { days });
    return {
      error: toUserFriendlyMessage(
        err,
        'Falha ao carregar transações por período',
      ),
    };
  }
}

export async function getTransactions(): Promise<ActionResult<ITransaction[]>> {
  logActionStart('getTransactions');

  try {
    const [profileResult, transactionsRes] = await Promise.all([
      getProfileCached(),
      serverFetch(routes.transactions.list),
    ]);

    if (!transactionsRes.ok) {
      const data = (await transactionsRes.json()) as Record<string, unknown>;
      const msg = getApiErrorMessage(data, 'Falha ao buscar transações');
      return { error: msg };
    }

    const userId = profileResult.data!.id!;

    const data = await transactionsRes.json();
    const rawList = extractList<RawTransaction>(data);

    const transactions = rawList.map((raw) =>
      mapRawToTransaction(raw, userId!),
    );
    return { data: transactions };
  } catch (err) {
    rethrowNavigationError(err);
    logActionError('getTransactions', err);
    return {
      error: toUserFriendlyMessage(err, 'Falha ao buscar transações'),
    };
  }
}
