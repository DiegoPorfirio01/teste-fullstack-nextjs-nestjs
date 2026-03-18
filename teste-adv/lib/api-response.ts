/**
 * Extracts a list from API response data. Supports:
 * - Direct array: [...]
 * - Wrapped in .data: { data: [...] }
 * - Wrapped in .items: { items: [...] }
 */
export function extractList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  const obj = data as { data?: unknown[]; items?: unknown[] };
  if (Array.isArray(obj?.data)) return obj.data as T[];
  if (Array.isArray(obj?.items)) return obj.items as T[];
  return [];
}
