'use server';

import { revalidatePath } from 'next/cache';
import { routes } from '@/api-routes';
import { getApiErrorMessage } from '@/lib/api-error';
import {
  rethrowNavigationError,
  toUserFriendlyMessage,
} from '@/lib/action-utils';
import { serverFetch } from '@/lib/server-fetch';
import {
  logActionStart,
  logActionSuccess,
  logActionError,
} from '@/lib/action-logger';
import type { BuyCreditsState } from '@/types';

export async function buyCreditsAction(
  _prevState: BuyCreditsState | undefined,
  formData: FormData,
): Promise<BuyCreditsState> {
  const packageId = formData.get('packageId') as string;
  if (!packageId) {
    return { fieldErrors: { packageId: ['Selecione um pacote'] } };
  }

  logActionStart('buyCreditsAction', { packageId });

  try {
    const res = await serverFetch(routes.credits.buy, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageId }),
    });

    const data = await res.json();

    if (!res.ok) {
      const msg = getApiErrorMessage(data, 'Falha ao comprar créditos');
      return { error: msg };
    }

    revalidatePath('/billing');
    revalidatePath('/dashboard');
    logActionSuccess('buyCreditsAction', { packageId });
    return { success: true };
  } catch (err) {
    rethrowNavigationError(err);
    logActionError('buyCreditsAction', err, { packageId });
    return {
      error: toUserFriendlyMessage(err, 'Erro inesperado ao comprar créditos'),
    };
  }
}
