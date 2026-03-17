"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { routes } from "@/api-routes";
import { serverFetch } from "@/lib/server-fetch";
import { AUTH_COOKIE_NAME } from "@/constants";

export type BuyCreditsState = {
  error?: string;
  success?: boolean;
};

async function getAuthHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    redirect("/auth/login");
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function buyCreditsAction(
  _prevState: BuyCreditsState | undefined,
  formData: FormData
): Promise<BuyCreditsState> {
  const packageId = formData.get("packageId") as string;
  if (!packageId) {
    return { error: "Selecione um pacote" };
  }

  try {
    const headers = await getAuthHeaders();
    const res = await serverFetch(routes.credits.buy, {
      method: "POST",
      headers,
      body: JSON.stringify({ packageId }),
    });

    const data = await res.json();

    if (!res.ok) {
      const message =
        data?.message ?? data?.error ?? "Falha ao comprar créditos";
      return {
        error: Array.isArray(message) ? message[0] : message,
      };
    }

    return { success: true };
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) {
      throw err;
    }
    return {
      error:
        err instanceof Error
          ? err.message
          : "Erro inesperado ao comprar créditos",
    };
  }
}
