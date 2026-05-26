# AI Resume Operating System — Architecture Blueprint

SmartCV.AZ evolves from a CV builder into a connected **AI Resume OS**: templates, design tokens, canvas, AI copilot, ATS scoring, and export pipelines share one realtime state graph.

## System Layers

```
┌─────────────────────────────────────────────────────────────────┐
│  Experience Layer (Next.js App Router)                          │
│  Studio · Builder · Visual Editor · Generator · Analytics       │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  Design OS (client)                                             │
│  design-store · sync-engine · template-catalog · themes         │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  Canvas Engine (Konva)                                          │
│  editor-store · layout-engine · cv-hydration                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  AI Orchestration (server)                                      │
│  /api/v1/ai/* · /api/v1/design/* · enterprise orchestrator      │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  Data Plane                                                     │
│  MongoDB (CVs, subscriptions) · Prisma (auth, AI usage)         │
│  Target: PostgreSQL + pgvector (schema.enterprise.prisma)      │
└─────────────────────────────────────────────────────────────────┘
```

## Interconnected Design Graph

| Change | Propagates to |
|--------|----------------|
| Theme palette | Canvas text fills, section colors, live ATS |
| Typography pairing | Heading/body fonts, density scale |
| Spacing | `autoSpacing()` reflow via sync-engine |
| Template selection | Full theme + metadata + canvas apply |
| ATS rules | Copilot suggestions, template ranking |
| Content edits | Live ATS recalc, AI context for copilot |

**Single source of truth (client):** `useDesignStore` + `useEditorStore`  
Theme mutations call `applyThemeToElements()` then `loadElements()`.

## Module Map

| Route | Role |
|-------|------|
| `/dashboard/studio` | Template gallery, filters, live theme panel, copilot |
| `/dashboard/builder` | Structured form sections |
| `/dashboard/builder/editor` | Konva canvas + design panel + copilot |
| `/dashboard/generator` | AI-first CV creation wizard |
| `/dashboard/examples` | Inspiration import → builder |
| `/dashboard/analytics` | ATS + usage metrics |

## Design Database Engine

**Phase 1 (shipped):** Seeded catalog in `lib/design-engine/template-catalog.ts` derived from `DESIGN_THEMES` with filter dimensions: aesthetic, industry, layout, ATS, modernity, mode.

**Phase 2:** PostgreSQL `Template` + `DesignAsset` tables with pgvector embeddings for semantic search ("FAANG backend resume dark minimal").

**Phase 3:** CDN-backed preview renders, user-generated templates, marketplace.

### Filter Dimensions

- Color, typography, font pairing, industry, ATS score, modernity, animation, recruiter friendliness, creativity, minimalism, luxury, dark/light, layout, spacing, visual density, aesthetic, country standards, portfolio style.

## API Surface (`/api/v1/design`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/themes` | GET | Themes, palettes, font pairings, filter metadata |
| `/suggest` | POST | Rule-based design issues + template recommendations |
| `/copilot` | POST | Streaming-capable AI design assistant (GPT-4o-mini) |

Existing: `/api/v1/ai/generate`, `/api/v1/ai/design` (enterprise design intelligence).

## AI Subsystems (Roadmap)

| System | Providers | Status |
|--------|-----------|--------|
| Text | OpenAI GPT-4o / orchestrator | Production |
| Design copilot | GPT-4o-mini + rule engine | Production |
| Image | Leonardo, Flux, SDXL | Planned — `AIGenerationJob` schema ready |
| Video | Runway, Pika, Luma | Planned |
| Voice | ElevenLabs, OpenAI Realtime | Planned |
| Realtime collab | WebSocket + CRDT | See `docs/enterprise/REALTIME.md` |

## Realtime Filtering

Studio and editor panels mutate Zustand state; canvas re-renders on every theme knob change without round-trip. Server suggest API used for batch analysis and template ranking.

## Export Pipeline

- PDF via `/api/cv/export`
- Future: PNG, DOCX, public portfolio URL, QR resume, presentation mode

## Database Schemas

- **Current:** MongoDB `cvs`, Prisma SQLite `User`
- **Target:** `prisma/schema.enterprise.prisma` — User, Resume, Template, CollaborationSession, AIGenerationJob, Asset, Subscription, AnalyticsEvent

## Deployment

- Vercel edge for Next.js
- MongoDB Atlas + PostgreSQL (Neon/Supabase) post-migration
- Redis for rate limits + job queue (`lib/enterprise/cache`, `job-queue`)
- Object storage (R2/S3) for assets and video renders

## Monetization

| Plan | CVs | AI | Design Studio |
|------|-----|-----|---------------|
| Free | 3 | 0 | Basic themes |
| Basic $3.99 | Unlimited | Limited | Full filters |
| Pro $9.99 | Unlimited | Unlimited | Premium themes + copilot + future video/image |

Premium templates gated via `TemplateMetadata.premium` + subscription check.

## Scalability

1. **Template catalog** → DB + CDN + ISR gallery pages
2. **AI jobs** → async queue with webhook callbacks
3. **Design sync** → Web Worker for heavy layout recalc
4. **Search** → pgvector + Redis cache
5. **Collab** → Yjs + Liveblocks/PartyKit

## Folder Structure (Design OS)

```
types/design-system.ts
lib/design-engine/
  themes.ts
  template-catalog.ts
  sync-engine.ts
lib/design-store.ts
components/design/
  DesignCustomizationPanel.tsx
  TemplateFilterBar.tsx
  AICopilot.tsx
app/dashboard/studio/page.tsx
app/api/v1/design/
  themes/route.ts
  suggest/route.ts
  copilot/route.ts
```

## Canva-Grade Visual Editor

The visual editor (`/dashboard/builder/editor`) now includes:

| Feature | Implementation |
|---------|----------------|
| Mouse resize | Konva `Transformer` — 8-point handles on selected elements |
| Smart snap | Grid snap + alignment guides to elements/page center |
| Drag/drop | Live drag with magenta alignment guides, commit on drop |
| Duplicate / Lock | Toolbar + sidebar properties |
| Canva sidebar | 8 tabs: Templates, Colors, Typography, Elements, Effects, Layout, Layers, AI |
| Layers panel | z-index list with forward/back |
| Template library | 32 seeded variants (8 themes × 4 layouts each) |

Key files: `components/editor/CanvaSidebar.tsx`, `SelectionTransformer.tsx`, `AlignmentGuides.tsx`, `lib/layout-engine.ts` (`computeAlignmentSnap`).


## Next Implementation Priorities

1. ~~Persist `designTheme` on CV save~~ **Done**
2. ~~Premium template gating (Basic/Pro)~~ **Done**
3. ~~Inline canvas text editing (double-click)~~ **Done**
4. ~~Shape/image/divider element types~~ **Done**
5. ~~SSE streaming copilot~~ **Done**
6. ~~Collab scaffold (API + Yjs client + presence)~~ **Done**
7. DOCX export + animated export pipeline
8. PostgreSQL migration per `docs/enterprise/MIGRATION-ROADMAP.md`
9. Dedicated WebSocket server for production collab (beyond polling)

---

*This document is the living architecture for the AI Resume OS. Enterprise details: `docs/enterprise/`.*
