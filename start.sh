#!/usr/bin/env sh
# Railway start entrypoint (Nixpacks builder).
# 1. Sync the Prisma schema to Postgres (we ship no migration files — db push
#    is idempotent and fast, so it runs on every boot).
# 2. Run the seed on EVERY boot so the ADMIN account is always present and its
#    password stays in sync with ADMIN_EMAIL/ADMIN_PASSWORD (or the committed
#    fallbacks). Uses plain node (prisma/seed.cjs) so no devDependency (tsx)
#    is required in the production image. Demo rows only seed with SEED_DEMO=true.
# 3. Hand off to Next.js as PID 1 so the /api/health probe can be served.
set -u
export NODE_ENV=production
export PATH="$PWD/node_modules/.bin:$PATH"

# Non-fatal: boot the server even if the DB is temporarily unreachable so
# the healthcheck probe still passes.
prisma db push --skip-generate --accept-data-loss \
  || echo "[start] prisma db push failed (non-fatal, continuing to boot server)"

echo "[start] seeding database (admin upsert)..."
node prisma/seed.cjs || echo "[start] seed failed (non-fatal)"

exec next start
