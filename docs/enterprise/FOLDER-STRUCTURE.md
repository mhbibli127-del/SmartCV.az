# Target Folder Structure

```
SmartCV.AZ/
├── app/
│   ├── (auth)/                    # Login, register, OTP
│   ├── (marketing)/               # Landing, pricing, blog
│   ├── (platform)/                # Authenticated shell (future rename from dashboard)
│   │   ├── layout.tsx             # Sidebar, theme, subscription provider
│   │   ├── page.tsx               # Overview
│   │   ├── builder/
│   │   │   ├── page.tsx           # Form builder
│   │   │   ├── editor/page.tsx    # Visual editor
│   │   │   └── preview/page.tsx
│   │   ├── generator/page.tsx
│   │   ├── examples/page.tsx
│   │   ├── marketplace/           # Community templates
│   │   ├── career/                # Interview, roadmap, cover letter
│   │   ├── analytics/page.tsx
│   │   └── account/page.tsx
│   ├── admin/                     # Enterprise admin
│   │   ├── revenue/
│   │   ├── users/
│   │   ├── moderation/
│   │   └── feature-flags/
│   └── api/
│       ├── v1/                    # Versioned enterprise API
│       │   ├── resumes/
│       │   ├── templates/
│       │   ├── ai/
│       │   ├── export/
│       │   ├── collaboration/
│       │   └── research/
│       ├── auth/                  # NextAuth
│       ├── paddle/                # Billing webhooks
│       └── cv/                    # Legacy (deprecate → v1)
│
├── components/
│   ├── ui/                        # Design system primitives
│   ├── editor/                    # Konva canvas system
│   ├── builder/                   # Form-based CV sections
│   ├── marketplace/               # Template cards, ratings
│   ├── career/                    # AI career widgets
│   ├── collaboration/             # Cursors, comments, presence
│   └── admin/
│
├── lib/
│   ├── enterprise/                # ★ Enterprise service layer
│   │   ├── ai/
│   │   │   ├── orchestrator.ts    # Pipeline coordinator
│   │   │   ├── prompts/           # Prompt templates per tone/style
│   │   │   ├── sources/           # LinkedIn, GitHub, PDF adapters
│   │   │   ├── embeddings.ts
│   │   │   ├── tone-styles.ts
│   │   │   └── design-intelligence.ts
│   │   ├── cache/
│   │   │   └── redis.ts
│   │   ├── queue/
│   │   │   └── job-queue.ts
│   │   ├── vector/
│   │   │   └── pgvector.ts
│   │   ├── research/
│   │   │   └── research-engine.ts
│   │   ├── collaboration/
│   │   │   └── presence.ts
│   │   ├── export/
│   │   │   └── export-engine.ts
│   │   ├── rate-limit/
│   │   │   └── limiter.ts
│   │   └── validation/
│   │       └── schemas.ts
│   ├── cv-service.ts              # Legacy Mongo (→ resume-service.ts)
│   ├── editor-store.ts
│   ├── layout-engine.ts
│   └── ...
│
├── prisma/
│   ├── schema.prisma              # Current dev (SQLite)
│   └── schema.enterprise.prisma   # Production target (PostgreSQL)
│
├── workers/                       # Background job processors
│   ├── ai-generation.worker.ts
│   ├── export.worker.ts
│   └── embeddings.worker.ts
│
├── docs/enterprise/               # Architecture docs
├── types/
│   ├── cv-document.ts
│   └── enterprise.ts
└── scripts/
    ├── migrate-mongo-to-pg.ts
    └── seed-templates.ts
```

## Naming Conventions

- **Services:** `{Domain}Service` — stateless, injectable
- **Routes:** REST nouns, plural — `/api/v1/resumes/:id/versions`
- **Components:** PascalCase, co-located tests when added
- **Hooks:** `use{Feature}` — client-only
- **Stores:** Zustand slices per domain (`editor-store`, `collaboration-store`)

## Plugin Architecture (Future)

```
lib/enterprise/plugins/
├── registry.ts
├── types.ts
└── integrations/
    ├── linkedin/
    ├── github/
    └── notion/
```

Third-party plugins register: `sourceAdapter`, `exportFormat`, `templateProvider`.
