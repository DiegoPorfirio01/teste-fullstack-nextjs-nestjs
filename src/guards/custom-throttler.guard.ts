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
    const userAgent =
      headers && typeof headers === 'object' && 'user-agent' in headers
        ? String(headers['user-agent'])
        : '';
    return Promise.resolve(`${ip}-${userAgent}`);
  }
}
