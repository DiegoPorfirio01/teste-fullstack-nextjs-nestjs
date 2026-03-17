# Teste API

NestJS API with **Fastify**, **Swagger**, auth guards, and rate limiting.

## Stack

- **Fastify** – HTTP adapter (replaces Express)
- **Swagger** – API docs at `/api/docs`
- **JWT** + **Session** auth guards
- **Throttler** – rate limiting (IP + User-Agent)
- **Prometheus** – metrics at `/metrics`

## Quick start

```bash
pnpm install
pnpm run start:dev
```

- API: http://localhost:3000
- Swagger: http://localhost:3000/api/docs

## Guards

JwtAuthGuard and CustomThrottlerGuard are registered globally, so all routes require a valid JWT by default unless they are marked with @Public().

## Guards (details)

### JwtAuthGuard

### CustomThrottlerGuard
https://docs.nestjs.com/security/rate-limiting#custom-throttler-guard

### RoleGuard
https://docs.nestjs.com/security/role-based-access-control

### SessionGuard
https://docs.nestjs.com/security/session-based-authentication