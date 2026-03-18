export const CACHE_PERIOD_DAYS = [7, 30, 90] as const;

export type CachePeriodDays = (typeof CACHE_PERIOD_DAYS)[number];

export function isValidPeriod(value: number): value is CachePeriodDays {
  return (CACHE_PERIOD_DAYS as readonly number[]).includes(value);
}

/** Cache key prefixes - single source of truth for invalidation */
export const CACHE_KEYS = {
  TRANSACTIONS_LIST: (userId: string) => `transactions:list:${userId}`,
  TRANSACTIONS_BY_PERIOD: (userId: string, days: number) =>
    `transactions:by-period:${userId}:${days}`,
} as const;

export const CACHE_TTL = {
  TRANSACTIONS_LIST_MS: 60 * 1000,
  TRANSACTIONS_BY_PERIOD_MS: 2 * 60 * 1000,
} as const;
