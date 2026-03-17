import { ExecutionContext, Injectable } from '@nestjs/common';
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
  protected async getTracker(
    req: Record<string, unknown>,
    _context?: ExecutionContext,
  ): Promise<string> {
    const ip = (req as { ip?: string }).ip ?? 'unknown';
    const userAgent =
      (req as { headers?: Record<string, string> }).headers?.['user-agent'] ??
      '';
    return `${ip}-${userAgent}`;
  }
}
