# Supabase + Prisma — SmartCV.AZ

## Environment variables

| Variable | Use | Example |
|----------|-----|---------|
| `DATABASE_URL` | App runtime (Next.js, Prisma client) | `*.pooler.supabase.com` **:6543** `?pgbouncer=true` |
| `DIRECT_URL` | `prisma db push`, `migrate`, Studio | `db.*.supabase.co` **:5432** or session pooler **:5432** |

Password must be in both URLs. Encode special characters (`@` → `%40`, `!` → `%21`).

`.env.local` is loaded by Next.js. Prisma CLI reads `prisma/.env` (auto-synced by `scripts/load-env.mjs`).

## Commands

```bash
npm run db:generate   # Prisma Client
npm run db:validate   # schema check
npm run db:check      # SELECT 1 via pooler
npm run db:push       # sync schema to Supabase (PostgreSQL)
npm run db:setup      # generate + validate + push + check
npm run verify:vercel # pre-deploy env check
```

## Local vs Vercel

- **Local:** `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL` = `http://localhost:3000`. Do not set `NODE_ENV=production` in `.env.local`.
- **Vercel:** Set production URLs + same `DATABASE_URL` / `DIRECT_URL` (prefer `db.*.supabase.co` for `DIRECT_URL` in CI).

If `db.*.supabase.co:5432` is unreachable locally (P1001), use session pooler for `DIRECT_URL`:

```env
DIRECT_URL="postgresql://postgres.REF:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres"
```

## Migration history

Older `prisma/migrations/*` were generated for **SQLite**. Production PostgreSQL was bootstrapped with:

```bash
npm run db:push
```

For new schema changes on Supabase, prefer `npm run db:push` in dev, then add a proper PostgreSQL migration when ready.

## Troubleshooting

| Error | Fix |
|-------|-----|
| `Authentication failed` | Wrong password; reset in Supabase → Database → password; update both URLs |
| `ECIRCUITBREAKER` | Too many failed logins; wait 5–15 min, reset password |
| `Can't reach database server` (db.*) | Use session pooler `:5432` for `DIRECT_URL` locally |
| `AUTOINCREMENT` on migrate | Do not use old SQLite migrations; use `db:push` |
| `EPERM` on `prisma generate` | Stop `npm run dev`, then run generate again |
