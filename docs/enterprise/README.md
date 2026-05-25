# SmartCV Enterprise Platform — Architecture Index

> Target: Canva × Resume.io × Framer AI × Figma for professional CV/resume creation.

## Documents

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System overview, layers, data flow, module map |
| [FOLDER-STRUCTURE.md](./FOLDER-STRUCTURE.md) | Target monorepo-style layout |
| [AI-SYSTEM.md](./AI-SYSTEM.md) | Prompt orchestration, pipelines, vector search |
| [REALTIME.md](./REALTIME.md) | Collaboration, WebSockets, presence |
| [INFRASTRUCTURE.md](./INFRASTRUCTURE.md) | Supabase, Redis, CDN, queues, scaling |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | CI/CD, environments, DevOps |
| [MIGRATION-ROADMAP.md](./MIGRATION-ROADMAP.md) | SQLite/Mongo → PostgreSQL consolidation |

## Schema

- **Current (dev):** `prisma/schema.prisma` — SQLite + NextAuth
- **Target (production):** `prisma/schema.enterprise.prisma` — PostgreSQL + pgvector

## Implementation Status

| Layer | Current | Target |
|-------|---------|--------|
| Frontend | Next.js 14 App Router | Next.js 15 App Router |
| Primary DB | MongoDB (CVs) + SQLite (auth) | PostgreSQL (Supabase) |
| Cache | None | Redis (Upstash) |
| Vector | None | pgvector |
| Billing | Paddle ✓ | Paddle ✓ |
| Editor | Konva ✓ | Konva + GPU virtualization |
| AI | OpenAI direct ✓ | Orchestrator + queues |
| Realtime | Socket.IO scaffold | Yjs + Socket.IO |
| Queue | None | BullMQ / Inngest |

## Quick Start (Enterprise Services)

```bash
# Required for full stack
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
OPENAI_API_KEY=sk-...

# Optional — enables live internet research
TAVILY_API_KEY=tvly-...
GITHUB_TOKEN=ghp_...
```

Core services live under `lib/enterprise/`.
