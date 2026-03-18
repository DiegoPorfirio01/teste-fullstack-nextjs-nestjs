# ============================================
# Build stage
# ============================================
FROM node:20-alpine AS build

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app

# Copy lock file and package.json first for better layer caching
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm run build

# Prune devDependencies for production
RUN pnpm prune --prod

# ============================================
# Production stage
# ============================================
FROM node:20-alpine

# Install pnpm for production (lightweight) corepack substitui instalação global do pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Non-root user: create group/user with explicit UID/GID before copying
# (avoids non-deterministic IDs and enables COPY --chown)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

WORKDIR /usr/src/app

# Copy production artifacts with correct ownership (no chown layer needed)
COPY --from=build --chown=nestjs:nodejs /usr/src/app/package.json ./
COPY --from=build --chown=nestjs:nodejs /usr/src/app/pnpm-lock.yaml ./
COPY --from=build --chown=nestjs:nodejs /usr/src/app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /usr/src/app/dist ./dist

USER nestjs

EXPOSE 3001

CMD ["pnpm", "run", "start:prod"]
