/**
 * Helper para extrair mensagem de erro do corpo da resposta da API.
 *
 * Formato NestJS (HttpException / ValidationPipe):
 * - { statusCode, message } — message pode ser string ou string[]
 * - { statusCode, message, error } — "error" é o nome do status (ex: "Bad Request")
 *
 * Uso: const message = getApiErrorMessage(data, "Falha padrão")
 */
export function getApiErrorMessage(
  data: unknown,
  fallback: string
): string {
  if (!data || typeof data !== "object") return fallback;

  const obj = data as Record<string, unknown>;
  const raw = obj.message ?? obj.error ?? fallback;

  if (Array.isArray(raw) && raw.length > 0) {
    return String(raw[0]);
  }
  if (typeof raw === "string") {
    return raw;
  }
  return fallback;
}
