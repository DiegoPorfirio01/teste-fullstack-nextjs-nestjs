import z from "zod";

/** Schema para resposta de autenticação da API */
export const authResponseSchema = z.object({
  accessToken: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    createdAt: z.string(),
  }),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;

/** Schema para resposta de wallet (saldo) da API */
export const walletResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  balance: z.number(),
});

export type WalletResponse = z.infer<typeof walletResponseSchema>;
