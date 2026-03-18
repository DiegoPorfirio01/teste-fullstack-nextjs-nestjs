'use server';

import { routes } from '@/api-routes';
import { getApiErrorMessage } from '@/lib/api-error';
import {
  rethrowNavigationError,
  toUserFriendlyMessage,
} from '@/lib/action-utils';
import { serverFetch } from '@/lib/server-fetch';
import { extractList } from '@/lib/api-response';
import { logActionStart, logActionError } from '@/lib/action-logger';
import type { ActionResult, ICreditPurchase } from '@/types';

export async function getCreditPurchases(): Promise<
  ActionResult<ICreditPurchase[]>
> {
  logActionStart('getCreditPurchases');

  try {
    const res = await serverFetch(routes.credits.list);
    if (!res.ok) {
      const data = (await res.json()) as Record<string, unknown>;
      const msg = getApiErrorMessage(data, 'Falha ao carregar compras');
      return { error: msg };
    }

    const data = await res.json();
    const list = extractList<ICreditPurchase>(data);
    return { data: list };
  } catch (err) {
    rethrowNavigationError(err);
    logActionError('getCreditPurchases', err);
    return {
      error: toUserFriendlyMessage(
        err,
        'Falha ao carregar compras de créditos',
      ),
    };
  }
}
