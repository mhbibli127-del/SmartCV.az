# SmartCV.AZ

Professional CV builder — templates, visual Studio editor, PDF export, and Google sign-in.

## Stack

- Next.js 14 (App Router)
- PostgreSQL + Prisma
- NextAuth (Google OAuth)
- Deploy: [Vercel](docs/VERCEL-DEPLOY.md)

## Local setup

```bash
cp .env.example .env.local
npm install
npm run db:push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run db:push` | Sync Prisma schema |
| `npm run verify:vercel` | Pre-deploy env check |

## Docs

- [Vercel deploy](docs/VERCEL-DEPLOY.md)
- [Supabase database](docs/DATABASE-SUPABASE.md)
