/**
 * OpenTelemetry instrumentation - deve ser carregado ANTES do bootstrap do NestJS.
 *
 * Para ativar: npm run start:prod:otel
 * Ou: NODE_OPTIONS='-r ./dist/instrumentation.js' npm run start:prod
 *
 * Para enviar traces ao Grafana Tempo / Jaeger, instale:
 *   @opentelemetry/exporter-trace-otlp-proto
 * e defina OTEL_EXPORTER_OTLP_ENDPOINT (ex: http://localhost:4318)
 */
import * as opentelemetry from '@opentelemetry/sdk-node';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';

const sdk = new opentelemetry.NodeSDK({
  serviceName: process.env.OTEL_SERVICE_NAME || 'teste-api',
  instrumentations: [
    new HttpInstrumentation({
      ignoreIncomingRequestHook: (req) => {
        // Ignorar endpoint de métricas para reduzir ruído
        return req.url?.includes('/metrics') ?? false;
      },
    }),
  ],
  // traceExporter: adicione OTLPTraceExporter quando configurar Grafana Tempo/Jaeger
});

sdk.start();
