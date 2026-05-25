# Enterprise Architecture

## Vision

SmartCV is a **design-intelligence + AI content platform** for resumes. Users generate from any source (prompt, LinkedIn, PDF, GitHub, job posting), edit in a Canva-class visual engine, collaborate in realtime, and export pixel-perfect PDF/DOCX/portfolio.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Next.js App Router)                      │
│  RSC Pages │ Client Islands │ Konva Canvas │ Framer Motion │ Zustand    │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
            │  Edge Layer  │ │  API Routes  │ │  WebSocket   │
            │  Middleware  │ │  /api/v1/*   │ │  Server      │
            │  Rate Limit  │ │  Validation  │ │  Presence    │
            └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
                   │                │                │
                   └────────────────┼────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION SERVICES                             │
│  CV Service │ Template Engine │ Export Engine │ Collaboration Service   │
│  AI Orchestrator │ Research Engine │ Analytics │ Billing (Paddle)       │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
   ┌─────────────┐           ┌─────────────┐           ┌─────────────┐
   │ PostgreSQL  │           │    Redis    │           │  pgvector   │
   │  (Supabase) │           │   (Cache)   │           │ (Embeddings)│
   └─────────────┘           └─────────────┘           └─────────────┘
          │                         │
          └─────────────┬───────────┘
                        ▼
                 ┌─────────────┐
                 │ Job Queue   │
                 │ BullMQ /    │
                 │ Inngest     │
                 └──────┬──────┘
                        ▼
                 ┌─────────────┐
                 │ AI Workers  │
                 │ OpenAI │    │
                 │ Research API│
                 └─────────────┘
```

## Layer Responsibilities

### 1. Presentation Layer
- **App Router pages** under `app/(platform)/` — dashboard modules
- **Server Components** for data-heavy views (analytics, marketplace)
- **Client Components** for editor, drag-drop, AI streaming UI
- **Design system** — `components/ui/*`, tokens in `app/globals.css`

### 2. API Layer
- Versioned REST: `/api/v1/resumes`, `/api/v1/ai/generate`, etc.
- Legacy routes remain during migration (`/api/cv/*`)
- **Validation:** Zod schemas in `lib/enterprise/validation/`
- **Auth:** NextAuth session + API key for integrations
- **Rate limiting:** Redis sliding window per user/IP

### 3. Domain Services
| Service | Responsibility |
|---------|----------------|
| `ResumeService` | CRUD, versioning, team ownership |
| `TemplateService` | Marketplace, ratings, premium gating |
| `EditorService` | Canvas state, layout engine, design intelligence |
| `ExportService` | PDF/PNG/DOCX via Puppeteer + docx library |
| `AIOrchestrator` | Multi-step pipelines, tone styles, ATS optimization |
| `ResearchEngine` | Internet data, trends, salary, skills |
| `CollaborationService` | Yjs CRDT, presence, comments |
| `BillingService` | Paddle webhooks, entitlements |
| `AnalyticsService` | Events, funnel, template performance |

### 4. Infrastructure Layer
- **PostgreSQL** — single source of truth (users, resumes, templates, billing)
- **Redis** — session cache, rate limits, job queue metadata, realtime pub/sub
- **pgvector** — semantic template search, AI memory, similar CV examples
- **Object storage** — Supabase Storage / UploadThing for PDFs, assets
- **CDN** — Vercel Edge / Cloudflare for static templates and exports

## Module Map (7 Core + Extensions)

| Module | Route | Backend |
|--------|-------|---------|
| Overview | `/dashboard` | `ResumeService.list`, `AnalyticsService.summary` |
| CV Builder | `/dashboard/builder` | Form schema → `ResumeService` |
| Visual Editor | `/dashboard/builder/editor` | Konva + `EditorService` + collaboration |
| AI Generator | `/dashboard/generator` | `AIOrchestrator.generateFromSources` |
| Examples | `/dashboard/examples` | `TemplateService` + vector search |
| Analytics | `/dashboard/analytics` | `AnalyticsService` |
| Account | `/dashboard/account` | `BillingService`, `UserService` |
| Marketplace | `/dashboard/marketplace` | `TemplateService` (community) |
| Career AI | `/dashboard/career` | Interview, gap analysis, roadmap |
| Admin | `/admin` | Revenue, moderation, feature flags |

## Data Flow: AI CV Generation

```
User Input (prompt | PDF | LinkedIn | GitHub | job URL)
        │
        ▼
┌───────────────────┐
│ Source Adapters   │  lib/enterprise/ai/sources/*
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Research Engine   │  Optional: Tavily web search, job market APIs
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Prompt Orchestrator│  Tone style + ATS rules + section schema
└─────────┬─────────┘
          ▼
┌───────────────────┐     Heavy jobs → Queue
│ OpenAI (stream)   │ ──────────────────────────► Worker
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Normalizer        │  lib/cv-normalizer.ts
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ ResumeService.save│  + ResumeVersion snapshot
└─────────┬─────────┘
          ▼
    Builder / Visual Editor
```

## Security Model

- **Authentication:** Auth.js v5 (migrate from NextAuth v4)
- **Authorization:** RBAC — `user | editor | admin | super_admin` + team roles
- **Entitlements:** Plan-based feature gates (`lib/user-plans.ts` → DB-driven)
- **AI abuse:** Rate limits + token budgets + content moderation
- **Uploads:** Virus scan hook, MIME validation, signed URLs, 10MB cap
- **Encryption:** At-rest via Supabase; sensitive tokens in `encrypted_*` columns

## Performance Strategy

| Technique | Where |
|-----------|-------|
| RSC + Suspense | Dashboard, marketplace lists |
| Dynamic import | Konva editor, Puppeteer |
| Virtualized canvas | `react-konva` + viewport culling |
| Redis cache | Template catalog, trending skills (TTL 1h) |
| Edge functions | Rate limit, geo routing |
| Queue workers | PDF export, bulk AI, embeddings |
| CDN | Exported PDFs, template previews |

## Current → Target Migration

See [MIGRATION-ROADMAP.md](./MIGRATION-ROADMAP.md). Phase 1 consolidates CV storage into PostgreSQL while keeping Mongo read-only fallback.
