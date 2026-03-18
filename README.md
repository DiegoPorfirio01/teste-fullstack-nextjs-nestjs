# Teste ADV

Frontend Next.js 16 com React 19 para gestão de carteira digital. Consome a API NestJS (`teste-api`) via Server Actions com autenticação JWT, UI com shadcn/ui e observabilidade Sentry.

## 1. Stack

| Tecnologia | Versão | Uso | Justificativa |
|------------|--------|-----|---------------|
| **Next.js** | 16.1.7 | Framework | App Router, RSC, Server Actions, Streaming |
| **React** | 19.2.3 | UI | `useActionState`, async transitions |
| **TypeScript** | ^5 | Tipagem | strict mode, path aliases |
| **Tailwind CSS** | v4 | Estilização | `@theme inline`, CSS variables, `@custom-variant` |
| **shadcn/ui** | radix-nova | Componentes | Composição, acessibilidade, temas |
| **Zod** | v4 | Validação | Schemas para forms e respostas da API |
| **Vitest** | ^4 | Testes | React Testing Library, coverage v8 |
| **Sentry** | ^10 | Observabilidade | Error tracking, Session Replay, Performance |
| **pnpm** | — | Package manager | Workspaces, performance |

## 2. Arquitetura e Estrutura

```
teste-adv/
├── app/                          # App Router
│   ├── layout.tsx                # Root layout (ThemeProvider, fonts)
│   ├── page.tsx                  # Redireciona via middleware
│   ├── globals.css               # Tailwind v4 + shadcn theme tokens
│   ├── global-error.tsx          # Sentry error boundary global
│   ├── auth/                     # Rotas públicas
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── error.tsx
│   └── (dashboard)/              # Route group — layout com sidebar
│       ├── layout.tsx
│       ├── dashboard/page.tsx
│       ├── perfil/page.tsx
│       ├── transactions/page.tsx
│       └── billing/page.tsx
├── actions/                      # Server Actions ("use server")
├── components/
│   ├── ui/                       # shadcn/ui (~31 componentes)
│   ├── auth/                     # Formulários de login/cadastro
│   ├── dashboard/                # Sidebar, cards, charts, tables
│   └── error/                    # Componentes de erro reutilizáveis
├── schemas/                      # Schemas Zod (validação de forms e API)
├── types/index.ts                # Tipos centralizados
├── lib/                          # Utilitários
│   ├── server-fetch.ts           # Fetch autenticado (Bearer do cookie)
│   ├── utils.ts                  # cn() (clsx + tailwind-merge)
│   ├── env.ts                    # Validação de env com Zod
│   ├── action-utils.ts           # rethrowNavigationError, toUserFriendlyMessage
│   ├── action-logger.ts          # Logging estruturado de actions
│   ├── api-error.ts              # Extração de mensagens da API
│   └── zod-utils.ts              # zodFieldErrors helper
├── api-routes.ts                 # URLs centralizadas da API NestJS
├── constants/index.ts            # AUTH_COOKIE_NAME, ROUTE_LABELS
├── enums/                        # TransactionType, TransactionStatus, etc.
├── hooks/                        # Custom hooks
├── middleware.ts                 # Auth middleware (JWT cookie check)
├── instrumentation.ts            # Sentry server-side
└── instrumentation-client.ts     # Sentry client-side
```

## 3. Padrões de Data Fetching

O projeto segue os padrões recomendados pela documentação oficial do Next.js para data fetching:

Referência: [Next.js Data Fetching Patterns](https://nextjs.org/docs/app/getting-started/fetching-data) | Skill: [`.agents/skills/next-best-practices/data-patterns.md`](.agents/skills/next-best-practices/data-patterns.md)

### Server Components para leitura

Dados são buscados em Server Components usando `serverFetch` + `Promise.all` para evitar waterfalls:

```tsx
export default async function DashboardPage() {
  const [credits, transactions] = await Promise.all([
    getWalletCredits(),
    getTransactions(),
  ])
  return <DashboardCards balance={credits} transactions={transactions} />
}
```

### Server Actions para mutações

Mutações usam `useActionState` (React 19) + Server Action + schema Zod. Nunca `onSubmit` com `fetch`:

```tsx
// actions/auth.ts — "use server"
export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({ /* ... */ })
  if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) }
  const res = await serverFetch(routes.auth.login, { method: "POST", body: JSON.stringify(parsed.data) })
  // ...
}

// components/auth/login-form.tsx — "use client"
const [state, formAction, isPending] = useActionState(loginAction, undefined)
return <form action={formAction}>...</form>
```

### Streaming com Suspense

Conteúdo dinâmico que demora é envolvido em `Suspense` com fallback (ex.: sidebar com dados do perfil):

```tsx
<Suspense fallback={<SidebarSkeleton />}>
  <SidebarWithProfile />
</Suspense>
```

## 4. Integração com API

O frontend **não** acessa banco de dados diretamente — toda comunicação passa por `serverFetch` → API NestJS.

| Componente | Arquivo | Responsabilidade |
|------------|---------|------------------|
| **serverFetch** | `lib/server-fetch.ts` | Fetch autenticado; lê cookie `auth-token`, envia `Authorization: Bearer`; redireciona em 401 |
| **routes** | `api-routes.ts` | URLs centralizadas da API (`routes.auth.login`, `routes.transactions.list`, etc.) |
| **env** | `lib/env.ts` | Validação de `NEXT_PUBLIC_API_URL` com Zod no startup |

Regras:
- **Nunca** usar `fetch` direto — sempre `serverFetch`
- **Nunca** ler o cookie de auth manualmente — `serverFetch` centraliza isso
- **Nunca** construir `Authorization: Bearer` fora de `serverFetch`

## 5. Autenticação

| Etapa | Implementação |
|-------|---------------|
| Login/Register | Server Action → `serverFetch` POST → API retorna `{ accessToken, user }` |
| Cookie | `auth-token` (httpOnly, secure em prod, sameSite: lax, 7 dias) |
| Middleware | `middleware.ts` valida JWT `exp`; redireciona auth↔protegido |
| Rotas protegidas | `/dashboard`, `/perfil`, `/billing`, `/transactions` |
| Rotas públicas | `/auth/login`, `/auth/register` |

Referência: [Next.js Authentication](https://nextjs.org/docs/app/guides/authentication)

## 6. Error Handling

O projeto implementa o padrão completo de error handling do Next.js:

Referência: Skill [`.agents/skills/next-best-practices/error-handling.md`](.agents/skills/next-best-practices/error-handling.md)

| Cenário | Mecanismo |
|---------|-----------|
| Erro em rota | `error.tsx` (Client Component com `reset()`) |
| Erro global/root layout | `global-error.tsx` (inclui `<html>` e `<body>`) |
| Erro de Server Action | `rethrowNavigationError(err)` + `toUserFriendlyMessage` |
| Erro na leitura | `ActionResult<T>` (discriminated union `{ data }` ou `{ error }`) |
| Exibição | Componente `ActionError` renderiza erros de `ActionResult` |

O `rethrowNavigationError` usa `unstable_rethrow` para não capturar erros de `redirect()` / `notFound()` no `catch`:

```tsx
catch (err) {
  rethrowNavigationError(err)  // Re-throws navigation errors
  return { error: toUserFriendlyMessage(err, "Fallback") }
}
```

## 7. UI com shadcn/ui

Estilo **radix-nova** com Tailwind CSS v4. Componentes adicionados como source code via CLI.

Referência: Skill [`.agents/skills/shadcn/SKILL.md`](.agents/skills/shadcn/SKILL.md)

| Padrão | Regra |
|--------|-------|
| Formulários | `FieldGroup` + `Field` + `FieldLabel` + `FieldError` (nunca `div` + `Label`) |
| Validação visual | `data-invalid` no `Field`, `aria-invalid` no controle |
| Espaçamento | `gap-*` (nunca `space-y-*` ou `space-x-*`) |
| Dimensões iguais | `size-*` (nunca `w-* h-*`) |
| Cores | Tokens semânticos (`bg-primary`, `text-muted-foreground`) — nunca raw values |
| Classes condicionais | `cn()` de `lib/utils.ts` (clsx + tailwind-merge) |
| Ícones | `lucide-react` com `data-icon` em Buttons |
| Toasts | `sonner` (`toast()`) |
| Tema dark | `next-themes` + CSS variables em `globals.css` |

```bash
pnpm dlx shadcn@latest add <component>
pnpm dlx shadcn@latest search <query>
pnpm dlx shadcn@latest docs <component>
```

## 8. Observabilidade com Sentry

Sentry integrado via `@sentry/nextjs` com `withSentryConfig` no `next.config.ts`.

| Recurso | Configuração |
|---------|--------------|
| Source maps | `widenClientFileUpload: true` |
| Ad-blocker bypass | `tunnelRoute: "/monitoring"` |
| Error boundaries | `global-error.tsx` com Sentry integration |
| Instrumentação | `instrumentation.ts` (server) + `instrumentation-client.ts` (client) |

| Ambiente | Traces | Session Replay | Erros |
|----------|--------|----------------|-------|
| Desenvolvimento | 100% | 100% | 100% |
| Produção | 10% | 10% | 100% (em sessões com erro) |

Referência: Skill [`.agents/skills/sentry-nextjs-sdk/SKILL.md`](.agents/skills/sentry-nextjs-sdk/SKILL.md)

## 9. Cache Components (Preparação para PPR)

O projeto está preparado para adotar **Cache Components** (Next.js 16+) que habilitam **Partial Prerendering** — mix de conteúdo estático, cached e dinâmico na mesma rota.

Referência: Skill [`.agents/skills/next-cache-components/SKILL.md`](.agents/skills/next-cache-components/SKILL.md)

```ts
// Para habilitar:
// next.config.ts
const nextConfig: NextConfig = { cacheComponents: true }
```

Três tipos de conteúdo:
- **Estático**: código síncrono, pré-renderizado no build
- **Cached** (`'use cache'`): dados async com `cacheLife()` e `cacheTag()`
- **Dinâmico** (Suspense): dados de runtime (`cookies()`, `headers()`)

A migração de `unstable_cache` para `'use cache'` elimina cache keys manuais e simplifica invalidação.

## 10. Testes

| Ferramenta | Uso |
|------------|-----|
| **Vitest** ^4 | Test runner (jsdom environment) |
| **React Testing Library** | Renderização e interação de componentes |
| **@vitest/coverage-v8** | Coverage (text, json, html) |

Testes ficam ao lado do arquivo testado (`*.test.ts` / `*.test.tsx`).

```bash
pnpm test              # roda todos os testes
pnpm test:watch        # modo watch
pnpm test:coverage     # com relatório de coverage
```

Padrão de mock para Server Actions: mockar `@/lib/env` → `serverFetch` → `next/headers` → `next/navigation` → `action-utils`, depois import dinâmico da action.

## 11. Async APIs (Next.js 15+)

APIs como `cookies()`, `headers()`, `params` e `searchParams` são **assíncronas** a partir do Next.js 15:

```tsx
const cookieStore = await cookies()
const { id } = await params
const { q } = await searchParams
```

Referência: Skill [`.agents/skills/next-best-practices/async-patterns.md`](.agents/skills/next-best-practices/async-patterns.md)

## 12. Cursor Rules, Agents e Skills

O projeto usa uma combinação de **Cursor Rules**, **Agent Skills** e **documentação referenciada** para guiar o desenvolvimento com assistentes de IA.

### Cursor Rules (`.cursor/rules/`)

Rules são arquivos `.mdc` que o Cursor carrega automaticamente. Cada rule tem um **escopo definido por globs** para aplicar as convenções certas no contexto certo — uma boa prática recomendada pela [documentação do Cursor](https://docs.cursor.com/guides/advanced/large-codebases):

> *"If there are common formatting patterns that you want to make sure Cursor adheres to, consider auto-attaching rules based on glob patterns."*

| Rule | Glob / Escopo | Propósito |
|------|---------------|-----------|
| `project-overview.mdc` | `alwaysApply: true` | Stack, estrutura de pastas, convenções gerais |
| `nextjs-patterns.mdc` | `app/**/*.{ts,tsx}` | RSC, data fetching, Suspense, metadata, middleware |
| `server-actions.mdc` | `actions/*.ts` | Padrão de action (validação, logging, error handling) |
| `shadcn-ui.mdc` | `**/*.tsx` | Componentes, forms, estilização, ícones |
| `testing.mdc` | `**/*.{test,spec}.{ts,tsx}` | Vitest, mocking, convenções de teste |
| `api-integration.mdc` | `lib/server-fetch.ts`, `api-routes.ts`, `actions/*.ts` | serverFetch, rotas, auth flow |

As rules com `alwaysApply: true` são carregadas em toda sessão. As demais são **auto-attached** quando arquivos que correspondem ao glob estão abertos — por exemplo, `server-actions.mdc` só é ativada ao editar arquivos em `actions/`.

### Agent Skills (`.agents/skills/`)

Skills são guias de boas práticas que podem ser compartilhados entre projetos. Cada skill contém um `SKILL.md` principal e arquivos de referência detalhados:

| Skill | Fonte | Conteúdo |
|-------|-------|----------|
| **next-best-practices** | [Vercel](https://vercel.com/docs/agent-resources/skills) | RSC boundaries, async patterns, data patterns, error handling, metadata, hydration, image/font optimization, suspense |
| **next-cache-components** | [Vercel](https://vercel.com/docs/agent-resources/skills) | PPR, `use cache`, `cacheLife`, `cacheTag`, `updateTag` |
| **shadcn** | [shadcn/ui](https://ui.shadcn.com) | Composição de componentes, formulários, styling, ícones, CLI |
| **sentry-nextjs-sdk** | [Sentry](https://github.com/getsentry/sentry-for-ai) | Error monitoring, tracing, session replay, profiling, logging |
| **vercel-composition-patterns** | [Vercel](https://vercel.com/docs/agent-resources/skills) | Compound components, React 19 patterns, state management |

Instalação de skills:

```bash
# Vercel skills
npx skills add vercel/next.js --skill next-best-practices
npx skills add vercel/next.js --skill next-cache-components

# Sentry
npx skills add getsentry/sentry-for-ai --skill sentry-nextjs-sdk

# shadcn (bundled com o pacote shadcn)
```

### Como Rules e Skills se complementam

```
┌─────────────────────────────────────────────────┐
│  Agent Skills (.agents/skills/)                 │
│  Boas práticas gerais — compartilháveis entre   │
│  projetos. Ex.: Next.js patterns, shadcn rules  │
└──────────────────────┬──────────────────────────┘
                       │ referencia
┌──────────────────────▼──────────────────────────┐
│  Cursor Rules (.cursor/rules/)                  │
│  Convenções específicas do projeto — serverFetch│
│  api-routes, auth flow, testing patterns        │
│  Auto-attached por glob patterns                │
└─────────────────────────────────────────────────┘
```

A rule `project-overview.mdc` instrui o agente a consultar os skills antes de implementar, criando um fluxo de **projeto-specific → framework-general**.

## 13. Diagrama de Fluxo

```mermaid
flowchart TD
    Browser --> Middleware
    Middleware -->|Token válido| AppRouter
    Middleware -->|Sem token| LoginPage

    subgraph AppRouter [App Router]
        ServerComponent -->|Promise.all| serverFetch
        serverFetch -->|Bearer token| NestAPI[API NestJS]
        NestAPI --> Response
        Response --> ServerComponent
        ServerComponent -->|props| ClientComponent
    end

    subgraph Forms [Formulários]
        ClientComponent -->|action={formAction}| ServerAction
        ServerAction -->|Zod validate| serverFetch2[serverFetch]
        serverFetch2 --> NestAPI
        ServerAction -->|state| ClientComponent
    end

    subgraph Observability [Observabilidade]
        ServerComponent -.-> Sentry
        ClientComponent -.-> Sentry
        ServerAction -.-> ActionLogger
    end
```

---

## Quick Start

```bash
# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar NEXT_PUBLIC_API_URL (ex.: http://localhost:3001)

# Iniciar dev server
pnpm dev
```

- App: http://localhost:3000
- Requer API rodando em `NEXT_PUBLIC_API_URL` (ver [teste-api](../teste-api/README.md))

## Scripts

```bash
pnpm dev              # Dev server
pnpm build            # Build de produção
pnpm start            # Serve build
pnpm lint             # ESLint
pnpm test             # Vitest (single run)
pnpm test:watch       # Vitest (watch mode)
pnpm test:coverage    # Vitest com coverage
```

## Variáveis de Ambiente

```env
# Obrigatória
NEXT_PUBLIC_API_URL=http://localhost:3001

# Sentry (opcional)
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=
```

Validação via Zod em `lib/env.ts` — a aplicação não sobe se `NEXT_PUBLIC_API_URL` for inválida.
