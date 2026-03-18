# Observabilidade – OpenTelemetry, Prometheus e Grafana

## Como ver os gráficos e traces no Grafana

### 1. Suba o stack e gere tráfego

```bash
cd teste-api
docker compose up -d
```

Aguarde ~1 minuto. Depois, **gere tráfego na API** (sem isso não haverá dados):

```bash
# Exemplo: algumas requisições
curl http://localhost:3001/v1/health
curl http://localhost:3001/transactions   # ou outra rota que exigir auth
# Ou acesse pelo navegador o frontend que chama a API
```

### 2. Acesse o Grafana

- **URL**: http://localhost:3002
- **Login**: `admin`
- **Senha**: `admin`

### 3. Ver os GRÁFICOS (Dashboard)

1. No menu lateral esquerdo, clique em **≡** (hamburger) se o menu estiver recolhido
2. Clique em **Dashboards**
3. Clique em **teste-api — Overview**

Se aparecer "No data" nos painéis: o Prometheus ainda não coletou métricas. Aguarde 1–2 minutos e gere mais tráfego na API.

### 4. Ver os TRACES

1. No menu lateral, clique em **Explore** (ícone de bússola ou "Explore")
2. No topo, onde está "Select datasource", escolha **Tempo**
3. Em **Query type**, selecione **Search**
4. Clique em **Run query** (ou "Search")

Os traces das requisições HTTP e das queries no banco aparecerão. Clique em um trace para ver os spans (HTTP, Postgres) e o tempo de cada operação.

Se não aparecer nada: a API precisa estar recebendo requisições. O Tempo só recebe traces quando há tráfego.

---

## Estrutura

- **MiddlewareModule** (`src/middleware/`): módulo NestJS com Prometheus e ObservabilityMiddleware
- **ObservabilityMiddleware**: coleta métricas HTTP (contagem, duração) e logs de requisição/resposta
- **instrumentation.ts**: inicia o SDK do OpenTelemetry para tracing HTTP
- **Grafana**: dashboards pré-provisionados e datasources (Prometheus + Tempo)

## Métricas Prometheus

Endpoint: `GET /v1/metrics`

| Métrica | Tipo | Descrição |
|---------|------|-----------|
| `http_requests_total` | Counter | Total de requisições por `method`, `route`, `status` |
| `http_request_duration_seconds` | Histogram | Duração das requisições em segundos |

## Uso local

1. Instale dependências: `pnpm install`
2. Execute: `pnpm run start:dev`
3. Acesse: `http://localhost:3001/v1/metrics`

## Docker (Prometheus + Grafana + Tempo)

```bash
pnpm install
docker compose up -d
```

- **API**: http://localhost:3001
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3002 (admin/admin)
- **Tempo**: http://localhost:3200 (tracing)

O Prometheus faz scrape de `http://api:3001/v1/metrics`.  
O Grafana tem datasources Prometheus e Tempo **pré-provisionados via YAML** (IaC).  
A API envia traces automaticamente para o Tempo via OTLP.

### Grafana – Provisioning (datasources)

Os datasources são configurados em `observability/grafana/provisioning/datasources/datasources.yml` — **não é necessário configurar manualmente na UI**. Configurações disponíveis:

| Opção | Valor | Descrição |
|-------|-------|-----------|
| `url` | `http://prometheus:9090` | URL interna no Docker network |
| `timeout` | 60 | Timeout HTTP (segundos) |
| `timeInterval` | 15s | Scrape interval (igual ao Prometheus) |
| `httpMethod` | POST | Mais eficiente para queries longas |
| `queryTimeout` | 60 | Query timeout no Prometheus |
| `defaultEditor` | Builder | Editor de queries (Builder ou Code) |
| `cacheLevel` | Low | Cache de queries |

Para aplicar mudanças no provisioning: reinicie o Grafana ou rode `docker compose restart grafana`.  
Se aparecer datasource duplicado (ex: prometheus-1): remova o volume `grafana_data` e suba de novo — `docker compose down -v && docker compose up -d` (isso apaga dashboards customizados).

## Grafana – Dashboards

O dashboard **teste-api — Overview** é provisionado automaticamente com:

- Requisições/segundo por rota
- Latência HTTP (P50, P95, P99)
- Taxa de erro (4xx, 5xx)
- Memória do processo

Acesse http://localhost:3002 → Dashboards.

## Traces (Grafana Tempo)

Para visualizar traces:

1. Acesse Grafana → **Explore** (ícone de bússola)
2. Selecione o datasource **Tempo**
3. Use **Search** para listar traces ou **TraceQL** para consultas

Os traces HTTP são enviados automaticamente quando a API roda com `OTEL_EXPORTER_OTLP_ENDPOINT` definido (já configurado no Docker).
