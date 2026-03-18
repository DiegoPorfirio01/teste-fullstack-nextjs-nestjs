/** Formata ISO date string para pt-BR (short date + short time). */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

/** Formata valor numérico em BRL. Default: 0 casas decimais. */
export function formatCurrency(
  value: number,
  options?: { maximumFractionDigits?: number }
): string {
  const maximumFractionDigits = options?.maximumFractionDigits ?? 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits,
  }).format(value);
}
