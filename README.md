# Teste — Plataforma de Carteira Digital

Plataforma financeira para gestão de carteira digital com depósitos, transferências entre usuários, estornos e compra de créditos. Composta por uma API NestJS e um frontend Next.js em um repositório único.

## Overview

O projeto é um **multi-projeto** com dois aplicativos independentes que se comunicam via REST:

```
teste/
├── teste-api/    # Backend — API financeira (NestJS 11 + Fastify)
├── teste-adv/    # Frontend — Painel de gestão (Next.js 16 + React 19)
└── README.md     # Este arquivo
```

| Projeto | Stack | Porta | Descrição |
|---------|-------|-------|-----------|
| **teste-api** | NestJS 11, Fastify, Prisma, PostgreSQL 17, Redis 7 | `3001` | API REST versionada (`/v1`) com JWT, cache Redis, rate limiting, métricas Prometheus e tracing OpenTelemetry |
| **teste-adv** | Next.js 16, React 19, Tailwind v4, shadcn/ui, Zod | `3000` | Interface web com App Router, Server Components, Server Actions, tema dark/light e Sentry |

Cada projeto gerencia suas próprias dependências com **pnpm** e possui seu próprio `package.json`, `tsconfig.json` e lockfile.

---

## Casos de Uso

### Atores

| Ator | Descrição |
|------|-----------|
| **Usuário Anônimo** | Pode se registrar e fazer login |
| **Usuário Autenticado** | Acessa todas as funcionalidades da carteira |
| **Admin** | Herda permissões do usuário autenticado (RBAC via `@Roles()`) |

### Autenticação

| Caso de Uso | Descrição |
|-------------|-----------|
| **Registrar conta** | Cria usuário com e-mail, senha e nome. Retorna JWT + dados do usuário. Carteira criada automaticamente com saldo zero |
| **Login** | Autentica com e-mail e senha. Retorna JWT + dados do usuário |

### Perfil

| Caso de Uso | Descrição |
|-------------|-----------|
| **Ver perfil** | Retorna nome, e-mail, role e data de criação |
| **Atualizar nome** | Altera o nome do usuário autenticado |
| **Alterar senha** | Valida a senha atual antes de aceitar a nova |
| **Excluir conta** | Remove o usuário e todos os dados associados (cascade) |

### Carteira

| Caso de Uso | Descrição |
|-------------|-----------|
| **Consultar saldo** | Retorna o saldo atual da carteira do usuário |
| **Depositar** | Adiciona valor ao saldo e cria transação do tipo `deposit` |

### Transações

| Caso de Uso | Descrição |
|-------------|-----------|
| **Transferir** | Transfere valor para outro usuário por e-mail. Valida saldo suficiente. Operação atômica via `$transaction` do Prisma. Valores recebidos ficam bloqueados por 10 minutos |
| **Listar transações** | Lista todas as transações do usuário (enviadas e recebidas) |
| **Listar por período** | Dados agregados por data para gráficos (7, 30 ou 90 dias) |
| **Estornar transferência** | Apenas o remetente pode estornar, com janela de 10 minutos. Reversão atômica dos saldos |

### Créditos

| Caso de Uso | Descrição |
|-------------|-----------|
| **Comprar pacote** | Pacotes de 10, 50 ou 100 créditos. Incrementa saldo da carteira |
| **Listar compras** | Histórico de compras de créditos do usuário |

---

## Regras de Negócio

### Autenticação e Segurança

- JWT stateless com expiração de 24h
- Todas as rotas exigem autenticação por padrão; rotas públicas marcadas com `@Public()`
- Rate limiting por IP + User-Agent em 3 tiers: 10 req/s, 50 req/10s, 100 req/60s
- Senhas hashadas com bcrypt
- CORS configurado via `CORS_ORIGIN` (padrão: `http://localhost:3000`)
- Headers de segurança via `@fastify/helmet` (CSP, HSTS, frameguard, noSniff)

### Carteira e Transações

- Cada usuário possui exatamente **uma carteira** (criada no registro, relação 1:1)
- Depósitos aceitam qualquer valor positivo
- Transferências exigem **saldo suficiente** no remetente
- Valores recebidos por transferência ficam **bloqueados por 10 minutos** (janela de estorno)
- Estorno permitido apenas pelo **remetente** e dentro de **10 minutos**
- Todas as operações financeiras são **atômicas** (Prisma `$transaction`)
- Transações preservam histórico: exclusão de usuário aplica `SetNull` em sender/receiver

### Cache

- Cache Redis por chave de usuário (`transactions:list:{userId}`, `transactions:by-period:{userId}:{days}`)
- Invalidação automática após mutações (deposit, transfer, reverse)

### Frontend

- Dados de leitura via Server Components com `serverFetch` (Bearer token do cookie)
- Mutações via Server Actions com validação Zod
- Cookie httpOnly `auth-token` (secure em prod, sameSite: lax, 7 dias)
- Middleware valida expiração do JWT; redireciona para `/auth/login` em 401
- Validação de `NEXT_PUBLIC_API_URL` no startup — app não sobe sem ela

---

## Rotas da API (`/v1`)

### Públicas (sem autenticação)

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/v1/auth/register` | Registrar novo usuário |
| `POST` | `/v1/auth/login` | Login (retorna JWT) |
| `GET` | `/v1/health` | Health check (PostgreSQL + Redis) |
| `GET` | `/v1/metrics` | Métricas Prometheus |

### Protegidas (Bearer JWT)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/v1/auth/profile` | Perfil do usuário |
| `PATCH` | `/v1/auth/profile` | Atualizar nome |
| `PATCH` | `/v1/auth/password` | Alterar senha |
| `DELETE` | `/v1/auth/me` | Excluir conta |
| `GET` | `/v1/wallet` | Consultar saldo |
| `POST` | `/v1/transactions/deposit` | Depositar |
| `POST` | `/v1/transactions/transfer` | Transferir para outro usuário |
| `GET` | `/v1/transactions` | Listar transações |
| `GET` | `/v1/transactions/by-period?days=N` | Transações agregadas (7, 30, 90 dias) |
| `POST` | `/v1/transactions/:id/reverse` | Estornar transferência |
| `POST` | `/v1/credits/buy` | Comprar pacote de créditos |
| `GET` | `/v1/credits` | Listar compras de créditos |

Documentação interativa (Swagger): **http://localhost:3001/api/docs**

### Rotas do Frontend

| Rota | Acesso | Descrição |
|------|--------|-----------|
| `/auth/login` | Pública | Tela de login |
| `/auth/register` | Pública | Tela de cadastro |
| `/dashboard` | Protegida | Painel principal (saldo, gráficos, transações recentes) |
| `/perfil` | Protegida | Gerenciamento de perfil |
| `/transactions` | Protegida | Histórico completo de transações |
| `/billing` | Protegida | Compra de créditos |

---

## Quick Start

### Pré-requisitos

- **Node.js** >= 20
- **pnpm** >= 9
- **Docker** e **Docker Compose** (para PostgreSQL, Redis e observabilidade)

### 1. Subir a infraestrutura

```bash
cd teste-api
docker compose up -d postgres redis
```

### 2. Configurar e iniciar a API

```bash
cd teste-api

# Variáveis de ambiente
cp .env.example .env
# Edite o .env se necessário (DATABASE_URL, JWT_SECRET, REDIS_URL)

# Dependências e banco
pnpm install
pnpm prisma:migrate
pnpm prisma:seed

# Iniciar servidor
pnpm run start:dev
```

A API estará disponível em **http://localhost:3001**.

### 3. Configurar e iniciar o Frontend

```bash
cd teste-adv

# Variáveis de ambiente
cp .env.example .env.local
# Verifique que NEXT_PUBLIC_API_URL=http://localhost:3001

# Dependências e servidor
pnpm install
pnpm dev
```

O frontend estará disponível em **http://localhost:3000**.

### Usuário de teste (seed)

```
E-mail:  admin@example.com
Senha:   password123
```

---

## Variáveis de Ambiente

### teste-api (`.env`)

| Variável | Obrigatória | Default | Descrição |
|----------|-------------|---------|-----------|
| `PORT` | Não | `3001` | Porta do servidor |
| `DATABASE_URL` | Sim | — | Connection string PostgreSQL |
| `JWT_SECRET` | Sim | — | Chave secreta para assinatura JWT |
| `JWT_EXPIRES_IN` | Não | `24h` | Expiração do token |
| `REDIS_URL` | Sim | — | Connection string Redis |
| `CORS_ORIGIN` | Não | `http://localhost:3000` | Origem permitida para CORS |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Não | — | Endpoint OTLP para tracing |

### teste-adv (`.env.local`)

| Variável | Obrigatória | Default | Descrição |
|----------|-------------|---------|-----------|
| `NEXT_PUBLIC_API_URL` | Sim | — | URL da API NestJS |
| `NEXT_PUBLIC_SENTRY_DSN` | Não | — | DSN do Sentry |
| `SENTRY_ORG` | Não | — | Organização Sentry |
| `SENTRY_PROJECT` | Não | — | Projeto Sentry |
| `SENTRY_AUTH_TOKEN` | Não | — | Token de auth Sentry (apenas CI/CD) |

---

## Infraestrutura (Docker Compose)

A stack completa de observabilidade fica em `teste-api/docker-compose.yml`:

| Serviço | Imagem | Porta | Descrição |
|---------|--------|-------|-----------|
| **PostgreSQL** | `postgres:17-alpine` | `5432` | Banco de dados |
| **Redis** | `redis:7-alpine` | `6379` | Cache |
| **API** | Build local | `3001` | NestJS API |
| **Prometheus** | `prom/prometheus:v2.52.0` | `9090` | Coleta de métricas |
| **Grafana Tempo** | `grafana/tempo:2.4.0` | `3200` | Tracing distribuído |
| **Grafana** | `grafana/grafana:11.2.0` | `3002` | Dashboards |

```bash
# Subir tudo (API + observabilidade)
cd teste-api
docker compose up -d

# Subir apenas dependências (dev local)
docker compose up -d postgres redis
```

---

## Testes

### teste-api — Unitários (Jest)

```bash
cd teste-api
pnpm test           # Executar testes
pnpm test:watch     # Modo watch
pnpm test:cov       # Com coverage
```

### teste-adv — Unitários (Vitest)

```bash
cd teste-adv
pnpm test           # Executar testes
pnpm test:watch     # Modo watch
pnpm test:coverage  # Com coverage
```

### teste-adv — E2E (Playwright)

O Playwright sobe automaticamente o Next.js e a API NestJS antes de executar os testes. Pré-requisitos: PostgreSQL e Redis rodando, banco migrado e seed executado.

```bash
cd teste-adv
pnpm test:e2e          # Headless
pnpm test:e2e:ui       # UI interativa do Playwright
pnpm test:e2e:headed   # Com navegador visível
```

---

## Arquitetura

```
┌──────────────────────────────────────────────────────────────┐
│                        Browser                               │
│                    http://localhost:3000                      │
└──────────────────────┬───────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────────┐
│                   teste-adv (Next.js 16)                     │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ Middleware   │  │ Server       │  │ Server Actions      │ │
│  │ (JWT check) │  │ Components   │  │ (mutações + Zod)    │ │
│  └──────┬──────┘  └──────┬───────┘  └──────────┬──────────┘ │
│         │                │ serverFetch          │            │
│         │                │ (Bearer token)       │            │
└─────────┼────────────────┼──────────────────────┼────────────┘
          │                │                      │
          │     ┌──────────▼──────────────────────▼──────┐
          │     │         teste-api (NestJS 11)          │
          │     │         http://localhost:3001           │
          │     │                                        │
          │     │  Middleware → Guards → Cache → Service  │
          │     │      │         │                │      │
          │     │      ▼         ▼                ▼      │
          │     │  Prometheus  JWT+Throttle   Repository │
          │     │  + OTel     + RoleGuard        │      │
          │     │                            ┌───▼───┐  │
          │     │                            │ Prisma │  │
          │     │                            └───┬───┘  │
          │     └────────────────────────────────┼──────┘
          │                                      │
     ┌────▼────┐                          ┌──────▼──────┐
     │  Redis  │                          │ PostgreSQL  │
     │  :6379  │                          │   :5432     │
     └─────────┘                          └─────────────┘
```

---

## Modelo de Dados

```
User (1) ──── (1) Wallet
  │
  ├── (N) Transaction (como sender)
  ├── (N) Transaction (como receiver)
  └── (N) CreditPurchase
```

| Entidade | Campos principais |
|----------|-------------------|
| **User** | id (UUID), email (unique), passwordHash, name, role, status, createdAt |
| **Wallet** | id (UUID), userId (FK unique), balance (Decimal 14,2), updatedAt |
| **Transaction** | id (UUID), type (deposit/transfer), amount (Decimal 14,2), senderId, receiverId, status (completed/reversed), createdAt |
| **CreditPurchase** | id (UUID), userId (FK), packageId, credits, amount (Decimal 10,2), createdAt |

---

## Documentação dos Projetos

- **API**: [`teste-api/README.md`](teste-api/README.md) — arquitetura, módulos, guards, cache, observabilidade, diagramas ER e de fluxo
- **Frontend**: [`teste-adv/README.md`](teste-adv/README.md) — padrões Next.js, data fetching, Server Actions, shadcn/ui, testes, Sentry
