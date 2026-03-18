'use server';

import { routes } from '@/api-routes';
import { getApiErrorMessage } from '@/lib/api-error';
import {
  rethrowNavigationError,
  toUserFriendlyMessage,
} from '@/lib/action-utils';
import { serverFetch } from '@/lib/server-fetch';
import { walletResponseSchema } from '@/schemas/api-response';
import { logActionStart, logActionError } from '@/lib/action-logger';
import type { ActionResult } from '@/types';

export async function getWalletCredits(): Promise<ActionResult<number>> {
  logActionStart('getWalletCredits');

  try {
    const res = await serverFetch(routes.wallet.get);
    if (!res.ok) {
      const data = (await res.json()) as Record<string, unknown>;
      const msg = getApiErrorMessage(data, 'Falha ao carregar saldo');
      return { error: msg };
    }

    const data = await res.json();
    const parsed = walletResponseSchema.safeParse(data);
    const balance = parsed.success ? parsed.data.balance : 0;
    return { data: balance };
  } catch (err) {
    rethrowNavigationError(err);
    logActionError('getWalletCredits', err);
    return {
      error: toUserFriendlyMessage(err, 'Falha ao carregar saldo'),
    };
  }
}
