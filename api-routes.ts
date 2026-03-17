import { env } from "@/lib/env";

export const routes = {
  auth: {
    register: `${env.NEXT_PUBLIC_API_URL}/auth/register`,
    login: `${env.NEXT_PUBLIC_API_URL}/auth/login`,
    updatePassword: `${env.NEXT_PUBLIC_API_URL}/auth/password`,
    deleteAccount: `${env.NEXT_PUBLIC_API_URL}/auth/me`,
    profile: `${env.NEXT_PUBLIC_API_URL}/auth/profile`,
  },
  credits: {
    buy: `${env.NEXT_PUBLIC_API_URL}/credits/buy`,
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