import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  /**
   * Use IP + User-Agent as tracker for more granular rate limiting.
   * This avoids different clients/browsers behind the same IP sharing the same limit.
   *
   * Optional: when req.user is available (e.g. after JwtAuthGuard), you can use
   * `req.user?.id ?? this.getAnonymousTracker(req)` for per-user limits.
   */
  protected getTracker(req: Record<string, unknown>): Promise<string> {
    const ip = typeof req.ip === 'string' ? req.ip : 'unknown';
    const { headers } = req;
    const uaRaw =
      headers && typeof headers === 'object' && 'user-agent' in headers
        ? (headers as Record<string, unknown>)['user-agent']
        : undefined;
    const userAgent =
      typeof uaRaw === 'string'
        ? uaRaw
        : Array.isArray(uaRaw)
          ? ((uaRaw[0] as string) ?? '')
          : '';
    return Promise.resolve(`${ip}-${userAgent}`);
  }
}
