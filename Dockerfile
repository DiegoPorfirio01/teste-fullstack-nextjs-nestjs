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

# Install pnpm for production (lightweight)
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app

# Copy production artifacts from build stage
COPY --from=build /usr/src/app/package.json ./
COPY --from=build /usr/src/app/pnpm-lock.yaml ./
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

# Non-root user for security (NestJS best practice: devops)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs && \
    chown -R nestjs:nodejs /usr/src/app

USER nestjs

EXPOSE 3000

# Health check (busybox wget --spider only checks availability)
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
    CMD wget -q --spider http://127.0.0.1:3000/metrics || exit 1

CMD ["pnpm", "run", "start:prod"]
