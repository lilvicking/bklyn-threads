# BKLYN THREADS — Runbook

How this standalone project is deployed and operated. This project shares
**nothing** with `pairtalk` (own folder, repo, env, DB, Railway service).

## Local development

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

## Database

Prisma + PostgreSQL. `DATABASE_URL` points at a Railway Postgres instance.

- Create a local Postgres and copy its URL into `.env`.
- `npm run db:push` syncs schema to DB (dev). Use `db:migrate` for versioned changes.
- `npm run db:seed` creates the admin user + demo catalog.

## Railway deployment

Deploy path uses the Dockerfile (standalone Next.js output).

1. GitHub repo for this project only.
2. Railway → New Project → deploy this repo.
3. Variables (see `.env.example`):
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `NEXTAUTH_URL`
   - Stripe keys + webhook secret
4. After first deploy, run DB setup: Railway **Deploy → Command**:
   `npx prisma db push` (or `npx prisma migrate deploy`).
5. Add Stripe webhook to `https://<domain>/api/webhooks/stripe`.

## Directory map

```
prisma/            schema + seed
src/app/           Next.js routes (pages + API)
src/components/    storefront, cart, layout, ui
src/lib/           prisma, auth, stripe, utils
src/types/         shared types + next-auth augmentation
```

## Risk of mixing with pairtalk

- Never `git remote` from pairtalk here — this project gets its own origin.
- Never copy pairtalk's `.env` — values differ (different DB, keys).
- Keep this folder outside any `pairtalk.worktrees` tree.

## Troubleshooting

| Symptom                                  | Fix                                              |
| ---------------------------------------- | ------------------------------------------------ |
| `PrismaClientInitializationError`        | Verify `DATABASE_URL` is set & reachable          |
| Webhook 400 "Invalid signature"          | Confirm `STRIPE_WEBHOOK_SECRET` is the endpoint secret |
| Admin can't sign in                      | Run `npm run db:seed` to create the admin user    |