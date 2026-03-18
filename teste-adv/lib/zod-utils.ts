import type { ZodError } from 'zod';

/**
 * Extrai erros de campo de um ZodError para uso em estado de formulário.
 * Retorna Record<string, string[]> onde a chave é o primeiro segmento do path.
 */
export function zodFieldErrors(error: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path[0]?.toString() ?? 'unknown';
    if (!fieldErrors[path]) fieldErrors[path] = [];
    fieldErrors[path].push(issue.message);
  }
  return fieldErrors;
}
