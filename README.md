# BKLYN THREADS

Retro 90s Brooklyn streetwear storefront — a **standalone project**, fully separate
from the `pairtalk` repo. It lives in its own folder, its own git repo, its own
remote, and its own Railway service.

## Stack

- **Next.js 14** (App Router) — `output: "standalone"` for Railway
- **Tailwind CSS v3** + **Framer Motion** — retro CRT / hanger-slide effects
- **Prisma + PostgreSQL** — catalog (products, variants, images) + orders + users
- **NextAuth (Credentials)** — login / session
- **Stripe Checkout** — cart → checkout, webhooks for order fulfillment

## Separation notes (so nothing mixes up)

- This folder `c:/Users/USER/Desktop/bklyn-threads` is **not** inside `pairtalk`
  and shares **no git history** with it.
- Its own repo/remote: `git remote add origin <your-new-repo-url>` then push.
- Env vars, Prisma schema, and the database are unique to this project.
- Do **not** copy `.env` from pairtalk here — generate fresh secrets.

## Local setup

```bash
npm install
cp .env.example .env      # fill in DATABASE_URL, AUTH_SECRET, Stripe keys
npm run db:generate       # generate Prisma client
npm run db:push           # create tables in your local DB
npm run db:seed           # optional: demo products + admin user
npm run dev               # http://localhost:3000
```

### Scripts

| Script               | Purpose                              |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Dev server                           |
| `npm run build`      | Prod build (standalone output)       |
| `npm run db:push`    | Apply schema to DB (dev)             |
| `npm run db:migrate` | Create & apply migrations            |
| `npm run db:seed`    | Seed catalog + admin user            |
| `npm run db:studio`  | Browse the DB in Prisma Studio       |

## Deploying to Railway

Railway reads `railway.json` (Dockerfile builder) for this project.

1. Push this repo to GitHub (its own remote).
2. On [Railway](https://railway.app), **New Project → Deploy from GitHub** and
   select this repo.
3. Set environment variables in Railway (from `.env.example`):
   - `DATABASE_URL` — provision a Railway **PostgreSQL** plugin and copy its URL.
   - `AUTH_SECRET` — `openssl rand -base64 32`
   - `NEXTAUTH_URL` — your deployed domain, e.g. `https://...up.railway.app`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`,
     `STRIPE_WEBHOOK_SECRET`
4. Build uses the Dockerfile (generates Prisma client + standalone server).
   First deploy will auto-run with `npm run db:push` — for schema changes,
   add a Railway deployment command after the build if you want migrations.
5. Set Stripe webhook endpoint URL to
   `https://<your-domain>/api/webhooks/stripe`.

See `docs/RUNBOOK.md` for details.

## Env vars

All config lives in `.env` (local) or Railway Variables (prod). Never commit a
real `.env` — it is git-ignored.