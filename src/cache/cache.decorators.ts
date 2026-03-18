import { ExecutionContext } from '@nestjs/common';
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { CACHE_KEYS, CACHE_TTL, isValidPeriod } from './cache.constants';

/**
 * Decorators for controller-level caching with per-user keys.
 * Use with @UseInterceptors(CacheInterceptor).
 */

/** Cache key factory for GET /transactions - includes userId */
export const CacheKeyTransactionsList = CacheKey((ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<{ user?: { userId: string } }>();
  return CACHE_KEYS.TRANSACTIONS_LIST(req.user?.userId ?? '');
});

/** Cache key factory for GET /transactions/by-period - includes userId and days */
export const CacheKeyTransactionsByPeriod = CacheKey(
  (ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<{
      user?: { userId: string };
      query?: { days?: string };
    }>();
    const daysNum = Number(req.query?.days);
    const days = isValidPeriod(daysNum) ? daysNum : 30;
    return CACHE_KEYS.TRANSACTIONS_BY_PERIOD(req.user?.userId ?? '', days);
  },
);

/** TTL for transactions list (1 min) */
export const CacheTTLTransactionsList = CacheTTL(
  CACHE_TTL.TRANSACTIONS_LIST_MS,
);

/** TTL for transactions by period (2 min) */
export const CacheTTLTransactionsByPeriod = CacheTTL(
  CACHE_TTL.TRANSACTIONS_BY_PERIOD_MS,
);
