import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
import type { IncomingMessage, ServerResponse } from 'http';

@Injectable()
export class ObservabilityMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  constructor(
    @InjectMetric('http_requests_total')
    private readonly httpRequestsCounter: Counter<string>,
    @InjectMetric('http_request_duration_seconds')
    private readonly httpRequestDuration: Histogram<string>,
  ) {}

  use(req: IncomingMessage, res: ServerResponse, next: (err?: Error) => void) {
    const method = req.method ?? 'UNKNOWN';
    const originalUrl = req.url ?? '';
    const forwarded = req.headers['x-forwarded-for'];
    const ip =
      (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0] ??
      req.socket.remoteAddress ??
      '';
    const userAgent = req.headers['user-agent'] ?? '';
    const requestId =
      String(req.headers['x-request-id'] ?? '') || crypto.randomUUID();

    const startTime = Date.now();
    const route = originalUrl.split('?')[0] || '/';

    res.setHeader('X-Request-ID', requestId);

    this.logger.log(
      `Incoming Request: ${method} ${originalUrl} - IP: ${ip} - User-Agent :${userAgent}`,
    );

    res.on('finish', () => {
      const statusCode = res.statusCode;
      const contentLength = res.getHeader('Content-Length');
      const duration = Date.now() - startTime;

      this.httpRequestsCounter.inc({
        method,
        route,
        status: String(statusCode ?? 0),
      });
      this.httpRequestDuration.observe({ method, route }, duration / 1000);

      this.logger.log(
        `Outgoing Response: ${method} ${originalUrl} - ${statusCode} - ${String(contentLength || 0)}b - ${duration}ms`,
      );

      if ((statusCode ?? 0) >= 400) {
        this.logger.error(
          `Error Response: ${method} ${originalUrl} - ${statusCode} - ${duration}ms`,
        );
      }
    });

    res.on('error', (error) => {
      this.logger.error(
        `Response Error: ${method} ${originalUrl} - ${error instanceof Error ? error.message : String(error)}`,
      );
    });

    req.on('timeout', () => {
      this.logger.warn(
        `Request Timeout: ${method} ${originalUrl} - ${Date.now() - startTime}ms`,
      );
    });

    next();
  }
}
