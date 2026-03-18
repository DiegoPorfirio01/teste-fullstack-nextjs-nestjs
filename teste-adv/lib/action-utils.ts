import { unstable_rethrow } from "next/navigation";

/**
 * Utilitários para Server Actions - tratamento de erros e redirect.
 *
 * Baseado em: Next.js error-handling - redirect/notFound não devem ser capturados.
 * @see https://nextjs.org/docs/app/api-reference/functions/redirect#behavior
 */

/**
 * Re-throw erros de navegação (redirect, notFound, etc.) para o Next.js tratar.
 * Use no início do catch: catch (err) { rethrowNavigationError(err); return { error }; }
 */
export function rethrowNavigationError(err: unknown): void {
  unstable_rethrow(err);
}

/**
 * Extrai mensagem de erro amigável para exibir no frontend.
 * Nunca retorna undefined - sempre uma string.
 */
export function toUserFriendlyMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string") return err;
  return fallback;
}
