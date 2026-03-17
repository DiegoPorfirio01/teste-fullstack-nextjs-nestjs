# Observabilidade – OpenTelemetry, Prometheus e Grafana

## Estrutura

- **MiddlewareModule** (`src/middleware/`): módulo NestJS com Prometheus e ObservabilityMiddleware
- **ObservabilityMiddleware**: coleta métricas HTTP (contagem, duração) e logs de requisição/resposta
- **instrumentation.ts**: inicia o SDK do OpenTelemetry para tracing HTTP

## Métricas Prometheus

Endpoint: `GET /metrics`

| Métrica | Tipo | Descrição |
|---------|------|-----------|
| `http_requests_total` | Counter | Total de requisições por `method`, `route`, `status` |
| `http_request_duration_seconds` | Histogram | Duração das requisições em segundos |

## Uso

1. Instale dependências: `npm install`
2. Execute: `npm run start:dev`
3. Acesse: `http://localhost:3000/metrics`

## Docker (Prometheus + Grafana)

```bash
pnpm install  # garantir dependências
docker compose up -d
```

- **API**: http://localhost:3000
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)

O Prometheus já está configurado para scrape `http://api:3000/metrics`.
O Grafana já tem o datasource Prometheus pré-provisionado.

## Grafana (queries sugeridas)

1. Crie dashboards com queries como:
   - `rate(http_requests_total[5m])` – requisições por segundo
   - `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))` – P95 da latência

## OpenTelemetry (traces)

Para traces com Grafana Tempo ou Jaeger:

```bash
npm install @opentelemetry/exporter-trace-otlp-proto
```

Defina `OTEL_EXPORTER_OTLP_ENDPOINT` (ex: `http://localhost:4318`) e execute:

```bash
npm run start:prod:otel
```
