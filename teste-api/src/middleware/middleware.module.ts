import { Module } from '@nestjs/common';
import {
  PrometheusModule,
  makeCounterProvider,
  makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';
import { MetricsController } from './metrics.controller';
import { ObservabilityMiddleware } from './observability.middleware';

const httpRequestsCounter = makeCounterProvider({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

const httpRequestDuration = makeHistogramProvider({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

@Module({
  imports: [
    PrometheusModule.register({
      path: '/v1/metrics',
      controller: MetricsController,
      defaultMetrics: {
        enabled: true,
      },
      defaultLabels: {
        app: 'teste-api',
      },
    }),
  ],
  providers: [
    ObservabilityMiddleware,
    httpRequestsCounter,
    httpRequestDuration,
  ],
  exports: [
    PrometheusModule,
    ObservabilityMiddleware,
    httpRequestsCounter,
    httpRequestDuration,
  ],
})
export class MiddlewareModule {}
