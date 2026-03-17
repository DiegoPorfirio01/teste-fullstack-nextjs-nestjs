"use server";

import { cookies } from "next/headers";
import { routes } from "@/api-routes";
import { serverFetch } from "@/lib/server-fetch";
import { AUTH_COOKIE_NAME } from "@/constants";
import type { IWallet } from "@/types";

export async function getWalletCredits(): Promise<number | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    const res = await serverFetch(routes.wallet.get, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return null;
    const wallet = (await res.json()) as IWallet;
    return wallet.balance ?? null;
  } catch {
    return null;
  }
}
