# Teste API

API financeira NestJS com carteiras, transações e créditos. Autenticação JWT, rate limiting, cache Redis, métricas Prometheus e tracing OpenTelemetry.

## 1. Introdução e Stack

| Tecnologia | Uso | Justificativa |
|------------|-----|---------------|
| **NestJS 11** | Framework | Arquitetura modular, DI, integração com ecossistema |
| **Fastify** | HTTP adapter | ~2–3x throughput em relação ao Express |
| **Prisma** | ORM | Type-safe, migrations, suporte a PostgreSQL |
| **PostgreSQL 17** | Banco de dados | Consistência e suporte a transações |
| **Redis 7** | Cache | Chaves por usuário, invalidação no write |
| **Swagger** | Documentação | API docs em `/api/docs` |
| **JWT** | Autenticação | Bearer token, stateless |
| **Throttler** | Rate limiting | Proteção por IP + User-Agent |

## 2. Arquitetura e Organização por Feature Modules

A aplicação segue organização modular por domínio:

- `auth/` – autenticação (register, login, perfil, senha)
- `users/` – entidade usuário e repositório
- `wallet/` – carteiras e saldo
- `transactions/` – depósitos, transferências, estornos
- `credits/` – compra de pacotes de créditos
- `guards/` – JWT, Throttler customizado, RoleGuard
- `cache/` – decorators, constantes, invalidação
- `middleware/` – observabilidade, Prometheus, métricas
- `health/` – health checks (PostgreSQL, Redis)
- `filters/` – exception filter global
- `prisma/` – cliente Prisma

Referência: [NestJS Modules](https://docs.nestjs.com/modules)

## 3. Fastify como HTTP Adapter

O projeto usa `FastifyAdapter` em vez de Express para melhor performance:

```typescript
// src/main.ts
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter(),
);
```

Helmet é configurado via `@fastify/helmet` com CSP, HSTS, frameguard e noSniff para segurança de headers.

Referência: [NestJS Performance](https://docs.nestjs.com/techniques/performance)

## 4. Validação Global com ValidationPipe

`ValidationPipe` está registrado globalmente em `main.ts`:

- **whitelist**: remove propriedades não decoradas nos DTOs
- **forbidNonWhitelisted**: rejeita payload com campos extras
- **transform**: converte tipos e aplica defaults
- **enableImplicitConversion**: conversão implícita (ex.: string → number)

DTOs usam `class-validator` e `class-transformer`.

Referência: [NestJS Validation](https://docs.nestjs.com/techniques/validation)

## 5. Exception Filter Global

`AllExceptionsFilter` é registrado como `APP_FILTER` e trata todas as exceções:

- **X-Request-ID** para rastreabilidade
- Log por severidade (4xx → warn, 5xx → error)
- Detalhes internos ocultos em produção

```typescript
// src/app.module.ts
{ provide: APP_FILTER, useClass: AllExceptionsFilter }
```

Referência: [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)

## 6. Guards (Autenticação e Autorização)

### JwtAuthGuard (global)

Registrado como `APP_GUARD`. Todas as rotas exigem JWT por padrão. Rotas marcadas com `@Public()` não exigem autenticação.

Referência: [NestJS Authentication](https://docs.nestjs.com/security/authentication)

### CustomThrottlerGuard

Rate limiting por IP + User-Agent, com 3 tiers:

| Tier | TTL | Limite |
|------|-----|--------|
| short | 1 s | 10 req |
| medium | 10 s | 50 req |
| long | 60 s | 100 req |

Referência: [Custom Throttler Guard](https://docs.nestjs.com/security/rate-limiting#custom-throttler-guard)

### RoleGuard

RBAC via decorator `@Roles()`. Exemplo direto da documentação oficial.

Referência: [Role-based Authentication](https://docs.nestjs.com/guards#role-based-authentication)

## 7. Estratégia de Cache com Redis

- **Store**: `@nestjs/cache-manager` com Keyv + KeyvRedis
- **Chaves tipadas**: `cache.constants.ts` (`transactions:list:{userId}`, `transactions:by-period:{userId}:{7|30|90}`)
- **Decorators**: `@CacheKeyTransactionsList`, `@CacheTTLTransactionsList`, etc.
- **Invalidação no write**: `invalidateUserCaches()` chamado após deposit, transfer e reverse

Referência: [NestJS Caching](https://docs.nestjs.com/techniques/caching)

## 8. Middleware de Observabilidade

### ObservabilityMiddleware

Aplicado globalmente (`forRoutes('*')`) com:

- Métricas Prometheus (counter + histogram)
- Header `X-Request-ID`
- Log de request/response

Referência: [NestJS Middleware](https://docs.nestjs.com/middleware)

### OpenTelemetry (instrumentation.ts)

Traces de HTTP e PostgreSQL via OTLP para Grafana Tempo. Ativado com `OTEL_EXPORTER_OTLP_ENDPOINT` ou `start:prod:otel`.

### Prometheus

Métricas em `/v1/metrics` com `@Public()` (sem JWT).

## 9. Health Checks

`HealthController` verifica PostgreSQL (Prisma) e Redis com `@nestjs/terminus`. Rotas marcadas com `@SkipThrottle()` e `@Public()`.

Referência: [NestJS Terminus](https://docs.nestjs.com/recipes/terminus)

## 10. Repository Pattern

Repositórios isolam o acesso a dados; serviços não usam Prisma diretamente:

- `TransactionRepository`
- `WalletRepository`
- `UserRepository`
- `CreditPurchaseRepository`

Facilita testes e eventual troca de ORM.

## 11. ConfigModule com Validação (Joi)

`ConfigModule.forRoot` valida variáveis obrigatórias na inicialização:

- `DATABASE_URL`
- `JWT_SECRET`
- `REDIS_URL`

A aplicação não sobe se a configuração estiver inválida.

Referência: [Configuration Schema Validation](https://docs.nestjs.com/techniques/configuration#schema-validation)

## 12. Versionamento de API

Versionamento por URI com prefixo `v`:

- Ex.: `/v1/auth/login`, `/v1/wallet`, `/v1/transactions`

Referência: [NestJS Versioning](https://docs.nestjs.com/techniques/versioning)

## 13. Infraestrutura (Docker Compose)

Stack disponível via `docker compose`:

| Serviço | Imagem | Porta |
|---------|--------|-------|
| PostgreSQL | postgres:17-alpine | 5432 |
| Redis | redis:7-alpine | 6379 |
| API | build local | 3001 |
| Prometheus | prom/prometheus:v2.52.0 | 9090 |
| Grafana Tempo | grafana/tempo:2.4.0 | 3200, 4317, 4318 |
| Grafana | grafana/grafana:11.2.0 | 3002 |

Rede dedicada `observability` com health checks nas dependências.

## 14. Testes

- **Jest** + **ts-jest**
- `@nestjs/testing` com `Test.createTestingModule`
- Specs colados aos arquivos fonte (`.spec.ts`)

## 15. Cursor Rules e Agents

O projeto usa **Cursor Rules** e **Agents (Skills)** para guiar o assistente de IA durante o desenvolvimento.

### O padrão

| Camada | Local | Propósito |
|--------|-------|-----------|
| **Cursor Rules** | `.cursor/rules/*.mdc` | Contexto específico do projeto; convenções locais, arquitetura, comandos. Aplicadas automaticamente pelo Cursor conforme glob ou `alwaysApply`. |
| **Agents / Skills** | `.agents/skills/*/` | Guias amplos de boas práticas (ex.: NestJS). Podem ser compartilhados entre projetos. O `AGENTS.md` compilado instrui LLMs em decisões arquiteturais, segurança e padrões de código. |

### Cursor Rules disponíveis

- `project-overview.mdc` — sempre ativa; visão geral, stack e comandos
- `nestjs-patterns.mdc` — ao editar `src/**/*.ts`; padrões de controllers, services e DTOs
- `tests.mdc` — ao editar `**/*.spec.ts`; convenções Jest e `Test.createTestingModule`
- `prisma-schema.mdc` — ao editar `prisma/**/*`; schema, mapeamentos e migrações

As regras usam tipos **Always** e **Auto Attached** conforme a [documentação oficial do Cursor](https://docs.cursor.com/context/rules): `alwaysApply` para regras globais, `globs` para vincular regras a padrões de arquivo (ex.: `**/*.ts`, `prisma/**/*`).

### Agents / Skills

O skill **NestJS Best Practices** (`.agents/skills/nestjs-best-practices/`) traz 40 regras em 10 categorias (arquitetura, DI, segurança, testes, etc.). O `AGENTS.md` é o documento principal para agentes; as regras em `rules/` detalham cada padrão com exemplos de código.

Referência: [agent-nestjs-skills](https://github.com/Kadajett/agent-nestjs-skills)

## 16. Diagrama de Fluxo de Request

```mermaid
flowchart TD
    Request --> ObservabilityMiddleware
    ObservabilityMiddleware --> JwtAuthGuard
    JwtAuthGuard --> CustomThrottlerGuard
    CustomThrottlerGuard --> RoleGuard
    RoleGuard --> CacheInterceptor
    CacheInterceptor --> Controller
    Controller --> Service
    Service --> Repository
    Repository --> Prisma
    Prisma --> PostgreSQL
    Service --> CacheInvalidation
    CacheInvalidation --> Redis
    AllExceptionsFilter --> Response
    Controller --> Response
```

## 17. Diagrama de Relacionamentos do Banco (ER)

```mermaid
erDiagram
    User ||--o| Wallet : "has one"
    User ||--o{ Transaction : "sends (sender)"
    User ||--o{ Transaction : "receives (receiver)"
    User ||--o{ CreditPurchase : "purchases"

    User {
        uuid id PK
        string email UK
        string passwordHash
        string name
        string role "default: user"
        string status "default: active"
        datetime createdAt
    }

    Wallet {
        uuid id PK
        uuid userId FK,UK
        decimal balance "Decimal(14,2)"
        datetime updatedAt
    }

    Transaction {
        uuid id PK
        string type "deposit | transfer"
        decimal amount "Decimal(14,2)"
        uuid senderId FK "nullable"
        uuid receiverId FK "nullable"
        string status "completed | reversed"
        datetime createdAt
    }

    CreditPurchase {
        uuid id PK
        uuid userId FK
        string packageId
        int credits
        decimal amount "Decimal(10,2)"
        datetime createdAt
    }
```

Destaques do schema:

- **User → Wallet**: 1:1 com `onDelete: Cascade`
- **User → Transaction**: sender/receiver com `onDelete: SetNull` para preservar histórico
- **User → CreditPurchase**: 1:N com `onDelete: Cascade`
- Índices compostos para queries frequentes: `[senderId, createdAt]`, `[receiverId, type, status, createdAt]`

## 18. Casos de Uso da Aplicação

```mermaid
flowchart LR
    subgraph actors [Atores]
        PublicUser["Usuário Anônimo"]
        AuthUser["Usuário Autenticado"]
        Admin["Admin"]
    end

    subgraph authUC [Autenticação]
        Register["Registrar conta"]
        Login["Login"]
    end

    subgraph profileUC [Perfil]
        ViewProfile["Ver perfil"]
        UpdateProfile["Atualizar nome"]
        UpdatePassword["Alterar senha"]
        DeleteAccount["Excluir conta"]
    end

    subgraph walletUC [Carteira]
        ViewBalance["Consultar saldo"]
        Deposit["Depositar"]
    end

    subgraph transUC [Transações]
        Transfer["Transferir para outro usuário"]
        ListTransactions["Listar transações"]
        ListByPeriod["Listar por período 7/30/90d"]
        ReverseTransfer["Estornar transferência em 10min"]
    end

    subgraph creditsUC [Créditos]
        BuyCredits["Comprar pacote de créditos"]
        ListPurchases["Listar compras de créditos"]
    end

    subgraph opsUC [Operacional]
        HealthCheck["Health check"]
        Metrics["Métricas Prometheus"]
    end

    PublicUser --> Register
    PublicUser --> Login
    PublicUser --> HealthCheck
    PublicUser --> Metrics

    AuthUser --> ViewProfile
    AuthUser --> UpdateProfile
    AuthUser --> UpdatePassword
    AuthUser --> DeleteAccount
    AuthUser --> ViewBalance
    AuthUser --> Deposit
    AuthUser --> Transfer
    AuthUser --> ListTransactions
    AuthUser --> ListByPeriod
    AuthUser --> ReverseTransfer
    AuthUser --> BuyCredits
    AuthUser --> ListPurchases

    Admin --> AuthUser
```

Resumo dos fluxos principais:

- **Registrar/Login**: rotas `@Public()`, retornam JWT
- **Depósito**: aumenta saldo e cria transação tipo `deposit`
- **Transferência**: valida saldo, lock de 10 min para valores recebidos, `$transaction` atômica
- **Estorno**: só remetente, janela 10 minutos, reversão atômica
- **Créditos**: pacotes 10/50/100, incrementam saldo
- **Health/Metrics**: rotas públicas sem rate limiting (`@SkipThrottle()`)

---

## Quick Start

```bash
pnpm install
pnpm prisma:migrate
pnpm prisma:seed
pnpm run start:dev
```

- API: http://localhost:3001
- Swagger: http://localhost:3001/api/docs
- Métricas: http://localhost:3001/v1/metrics
- Health: http://localhost:3001/v1/health

## Database

Configure `DATABASE_URL` no `.env`:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/teste_api
```

Suba o PostgreSQL e Redis (ex.: `docker compose up -d postgres redis`) e execute:

```bash
pnpm prisma:migrate
pnpm prisma:seed
```
