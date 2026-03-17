import { env } from "@/lib/env";

export const routes = {
  auth: {
    register: `${env.NEXT_PUBLIC_API_URL}/auth/register`,
    login: `${env.NEXT_PUBLIC_API_URL}/auth/login`,
  },

  wallet: {
    get: `${env.NEXT_PUBLIC_API_URL}/wallet`,
  },

  transactions: {
    deposit: `${env.NEXT_PUBLIC_API_URL}/transactions/deposit`,
    transfer: `${env.NEXT_PUBLIC_API_URL}/transactions/transfer`,
    list: `${env.NEXT_PUBLIC_API_URL}/transactions`,
    reverse: (id: string) =>
      `${env.NEXT_PUBLIC_API_URL}/transactions/${id}/reverse`,
  },
};