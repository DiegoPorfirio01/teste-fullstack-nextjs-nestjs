import { env } from "@/lib/env";

const base = `${env.NEXT_PUBLIC_API_URL}/v1`;

export const routes = {
  auth: {
    register: `${base}/auth/register`,
    login: `${base}/auth/login`,
    updatePassword: `${base}/auth/password`,
    deleteAccount: `${base}/auth/me`,
    profile: `${base}/auth/profile`,
  },
  credits: {
    buy: `${base}/credits/buy`,
    list: `${base}/credits`,
  },

  wallet: {
    get: `${base}/wallet`,
  },

  transactions: {
    transfer: `${base}/transactions/transfer`,
    list: `${base}/transactions`,
    byPeriod: (days: number) =>
      `${base}/transactions/by-period?days=${days}`,
    reverse: (id: string) =>
      `${base}/transactions/${id}/reverse`,
  },
};