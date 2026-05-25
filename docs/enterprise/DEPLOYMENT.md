# Deployment & DevOps

## CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml (recommended)
name: Deploy
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npx prisma validate --schema=prisma/schema.enterprise.prisma

  build:
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          SKIP_ENV_VALIDATION: true

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Environment Variables

See `.env.local.example` for full list. Critical production vars:

```env
# Database
DATABASE_URL=
DATABASE_URL_POOLED=
DIRECT_URL=

# Auth
NEXTAUTH_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Billing
PADDLE_API_KEY=
PADDLE_WEBHOOK_SECRET=
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=
NEXT_PUBLIC_PADDLE_ENV=production

# AI
OPENAI_API_KEY=

# Cache & Queue
REDIS_URL=
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# Storage
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=

# Research (optional)
TAVILY_API_KEY=
GITHUB_TOKEN=

# Monitoring
SENTRY_DSN=
```

## Database Migrations

```bash
# Development (SQLite — current)
npx prisma migrate dev

# Production (PostgreSQL — enterprise schema)
npx prisma migrate deploy --schema=prisma/schema.enterprise.prisma
```

Enable pgvector on Supabase:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## Worker Deployment

Workers run separately from Vercel (no long-running processes):

```bash
# Option A: Inngest (serverless functions)
# Functions auto-deploy with Next.js via app/api/inngest/route.ts

# Option B: Dedicated worker
node workers/ai-generation.worker.js
```

## Rollback Strategy

1. Vercel instant rollback to previous deployment
2. Database: forward-only migrations; reversals via new migration
3. Feature flags: disable broken features without redeploy

## Health Checks

```
GET /api/health
→ { status: "ok", db: "ok", redis: "ok", queue: "ok" }
```

## Staging Checklist

- [ ] Paddle sandbox webhooks configured
- [ ] Supabase staging project isolated
- [ ] OpenAI usage limits set
- [ ] Sentry environment = staging
- [ ] E2E smoke: register → create CV → export PDF → upgrade

## Production Checklist

- [ ] MongoDB deprecated / read-only
- [ ] All secrets in platform vault (not .env in repo)
- [ ] Rate limiting enabled
- [ ] Backup restore tested
- [ ] Paddle live mode + webhook signature verified
- [ ] CSP headers configured
- [ ] GDPR: data export + delete endpoints live
