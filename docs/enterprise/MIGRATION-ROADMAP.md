# Migration Roadmap

## Current State (Feb 2026)

| Data | Store | Status |
|------|-------|--------|
| Auth users | Prisma SQLite + JSON fallback | Active |
| CV documents | MongoDB Mongoose | **Primary** |
| Subscriptions | MongoDB SaasUser | **Primary** |
| AI usage | Prisma User.aiUsed | Active |
| Analytics | MongoDB interactions | Optional |
| Templates | Prisma CVSample + static examples | Mixed |

## Target State

**Single PostgreSQL database** (Supabase) with pgvector, Redis cache, Paddle billing on `subscriptions` table.

## Phases

### Phase 0 — Foundation (Week 1–2) ✅ Started
- [x] Enterprise architecture docs
- [x] Enterprise Prisma schema (`schema.enterprise.prisma`)
- [x] Service layer scaffolding (`lib/enterprise/`)
- [ ] Health check endpoint
- [ ] Redis cache integration

### Phase 1 — Data Consolidation (Week 3–4)
- [ ] Provision Supabase PostgreSQL + pgvector
- [ ] Dual-write: save CV to Mongo + Postgres
- [ ] Migration script: `scripts/migrate-mongo-to-pg.ts`
- [ ] Switch reads to Postgres with Mongo fallback
- [ ] Deprecate SaasUser → `subscriptions` table
- [ ] Remove JSON auth store

### Phase 2 — API Versioning (Week 5–6)
- [ ] `/api/v1/resumes` CRUD
- [ ] `/api/v1/ai/generate` with orchestrator
- [ ] Deprecation headers on `/api/cv/*`
- [ ] Zod validation on all v1 routes

### Phase 3 — AI Platform (Week 7–9)
- [ ] Source adapters (PDF, GitHub, LinkedIn)
- [ ] Research engine (Tavily)
- [ ] Queue for heavy generation
- [ ] Vector search for templates
- [ ] 8 tone styles in generator UI

### Phase 4 — Editor & Marketplace (Week 10–12)
- [ ] Template marketplace UI
- [ ] Community uploads + moderation
- [ ] Design intelligence auto-fix
- [ ] DOCX + portfolio export
- [ ] GPU-friendly canvas virtualization

### Phase 5 — Collaboration & Teams (Week 13–16)
- [ ] Yjs integration
- [ ] Team workspaces
- [ ] Comments + version history
- [ ] Socket.IO + Redis adapter

### Phase 6 — Enterprise & Scale (Week 17+)
- [ ] SSO/SAML
- [ ] Admin revenue dashboard
- [ ] Feature flags
- [ ] Plugin SDK
- [ ] Multilingual AI

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Data loss during migration | Dual-write + verification counts |
| Downtime | Blue-green deploy, feature flags |
| AI cost spike | Token budgets, queue throttling |
| Prisma file lock on Windows | Stop dev server before `prisma generate` |

## Next.js 15 Upgrade

```bash
npm install next@15 react@19 react-dom@19
# Test: async request APIs, caching defaults changed
```

Schedule after Phase 1 data stability.

## Stripe Removal

- Delete `app/api/stripe/*`, `app/api/webhook/stripe`
- Remove `stripe` from package.json
- Update docs/STRIPE_SETUP.md → archive

## MongoDB Retirement Criteria

1. 100% reads from Postgres for 7 days
2. Zero dual-write errors
3. Backup verified
4. Drop Mongo connection from production env
