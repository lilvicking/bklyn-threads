#!/usr/bin/env sh
# Railway start entrypoint (Nixpacks builder).
# 1. Sync the Prisma schema to Postgres (we ship no migration files — db push
#    is idempotent and fast, so it runs on every boot).
# 2. When RUN_DB_SEED=true, run the seed ONCE to create the ADMIN account +
#    demo rows from prisma/seed.ts. Set this env var to false (or unset it)
#    for everyday production use so no demo data is ever created.
# 3. Hand off to Next.js as PID 1 so the /api/health probe can be served.
set -u
export NODE_ENV=production
export PATH="$PWD/node_modules/.bin:$PATH"

# Non-fatal: boot the server even if the DB is temporarily unreachable so
# the healthcheck probe still passes.
prisma db push --skip-generate --accept-data-loss \
  || echo "[start] prisma db push failed (non-fatal, continuing to boot server)"

if [ "${RUN_DB_SEED:-false}" = "true" ]; then
  echo "[start] RUN_DB_SEED=true — seeding database (admin + demo data)..."
  tsx prisma/seed.ts || echo "[start] seed failed (non-fatal)"
fi

exec next start
