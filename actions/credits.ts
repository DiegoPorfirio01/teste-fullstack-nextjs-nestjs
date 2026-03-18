"use server";

import { routes } from "@/api-routes";
import { getApiErrorMessage } from "@/lib/api-error";
import { rethrowNavigationError, toUserFriendlyMessage } from "@/lib/action-utils";
import {
  logActionStart,
  logActionSuccess,
  logActionError,
} from "@/lib/action-logger";
import { serverFetch } from "@/lib/server-fetch";
import { extractList } from "@/lib/api-response";
import type { ActionResult, ICreditPurchase } from "@/types";

export async function getCreditPurchases(): Promise<
  ActionResult<ICreditPurchase[]>
> {
  logActionStart("getCreditPurchases");
  try {
    const res = await serverFetch(routes.credits.list);
    if (!res.ok) {
      const data = (await res.json()) as Record<string, unknown>;
      const msg = getApiErrorMessage(data, "Falha ao carregar compras");
      logActionError("getCreditPurchases", new Error(msg), { status: res.status, responseData: data });
      return { error: msg };
    }

    const data = await res.json();
    const list = extractList<ICreditPurchase>(data);
    logActionSuccess("getCreditPurchases", { count: list.length });
    return { data: list };
  } catch (err) {
    logActionError("getCreditPurchases", err);
    rethrowNavigationError(err);
    return {
      error: toUserFriendlyMessage(err, "Falha ao carregar compras de créditos"),
    };
  }
}
