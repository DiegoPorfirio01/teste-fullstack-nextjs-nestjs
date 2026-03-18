#!/bin/sh
set -e

echo "[entrypoint] Aplicando migrations..."
pnpm prisma migrate deploy

echo "[entrypoint] Iniciando API..."
exec node -r ./dist/src/instrumentation.js dist/src/main.js
