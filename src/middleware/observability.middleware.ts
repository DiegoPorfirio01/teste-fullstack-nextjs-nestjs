import { Injectable, Logger, NestMiddleware } from '@nestjs/common';

@Injectable()
export class ObservabilityMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: { method: string; url: string; ip: string; headers?: Record<string, string>; on?: (ev: string, fn: () => void) => void }, res: { on: (ev: string, fn: (e?: unknown) => void) => void; statusCode?: number; get?: (name: string) => string | undefined }, next: () => void) {
    const { method, url: originalUrl, ip } = req;
    const userAgent = req.headers?.['user-agent'] ?? '';
    const startTime = Date.now();

    this.logger.log(
      `Incoming Request: ${method} ${originalUrl} - IP: ${ip} - User-Agent :${userAgent}`,
    );

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get?.('Content-Length');
      const duration = Date.now() - startTime;

      this.logger.log(
        `Outgoing Response: ${method} ${originalUrl} - ${statusCode} - ${contentLength || 0}b - ${duration}ms`,
      );

      if ((statusCode ?? 0) >= 400) {
        this.logger.error(
          `Error Response: ${method} ${originalUrl} - ${statusCode} - ${duration}ms`,
        );
      }
    });

    // Log de erros
    res.on('error', (error) => {
      this.logger.error(
        `Response Error: ${method} ${originalUrl} - ${error instanceof Error ? error.message : String(error)}`,
      );
    });

    // Log de timeout
    req.on?.('timeout', () => {
      this.logger.warn(
        `Request Timeout: ${method} ${originalUrl} - ${Date.now() - startTime}ms`,
      );
    });

    next();
  }
}