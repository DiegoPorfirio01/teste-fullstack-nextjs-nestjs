/**
 * OpenTelemetry instrumentation - deve ser carregado ANTES do bootstrap do NestJS.
 *
 * Para ativar: npm run start:prod:otel
 * Ou com Docker: OTEL_EXPORTER_OTLP_ENDPOINT=http://tempo:4318
 *
 * Envia traces para Grafana Tempo quando OTEL_EXPORTER_OTLP_ENDPOINT está definido.
 *
 * Instrumentações:
 * - HTTP: requisições entrantes/saídas (rotas da API, chamadas externas)
 * - pg: queries PostgreSQL (via Prisma) — permite identificar gargalo no banco
 */
import * as opentelemetry from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';

const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
const traceExporter = otlpEndpoint
  ? new OTLPTraceExporter({ url: `${otlpEndpoint}/v1/traces` })
  : undefined;

const sdk = new opentelemetry.NodeSDK({
  serviceName: process.env.OTEL_SERVICE_NAME || 'teste-api',
  instrumentations: [
    new HttpInstrumentation({
      ignoreIncomingRequestHook: (req) => {
        return req.url?.includes('/v1/metrics') ?? false;
      },
    }),
    new PgInstrumentation({
      enhancedDatabaseReporting: true,
    }),
  ],
  traceExporter,
});

sdk.start();
