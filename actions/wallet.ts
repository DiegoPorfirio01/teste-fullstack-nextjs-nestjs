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
import { walletResponseSchema } from "@/schemas/api-response";
import type { ActionResult } from "@/types";

export async function getWalletCredits(): Promise<ActionResult<number>> {
  logActionStart("getWalletCredits");
  try {
    const res = await serverFetch(routes.wallet.get);
    if (!res.ok) {
      const data = (await res.json()) as Record<string, unknown>;
      const msg = getApiErrorMessage(data, "Falha ao carregar saldo");
      logActionError("getWalletCredits", new Error(msg), { status: res.status, responseData: data });
      return { error: msg };
    }

    const data = await res.json();
    const parsed = walletResponseSchema.safeParse(data);
    const balance = parsed.success ? parsed.data.balance : 0;
    logActionSuccess("getWalletCredits", { balance });
    return { data: balance };
  } catch (err) {
    logActionError("getWalletCredits", err);
    rethrowNavigationError(err);
    return {
      error: toUserFriendlyMessage(err, "Falha ao carregar saldo"),
    };
  }
}
