# AI System Architecture

## Overview

The AI layer is a **pipeline orchestrator**, not a single API call. It coordinates source ingestion, optional internet research, prompt assembly, model invocation, post-processing, and persistence.

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│   Sources   │ → │  Research   │ → │  Prompts    │ → │   Model     │
│  Adapters   │   │  Engine     │   │ Orchestrator│   │  (OpenAI)   │
└─────────────┘   └─────────────┘   └─────────────┘   └──────┬──────┘
                                                              │
                    ┌─────────────┐   ┌─────────────┐         │
                    │  Vector DB  │ ← │ Post-process│ ←───────┘
                    │  (memory)   │   │ + ATS score │
                    └─────────────┘   └─────────────┘
```

## Tone Styles

Defined in `lib/enterprise/ai/tone-styles.ts`:

| Style | Use case | Prompt bias |
|-------|----------|-------------|
| `corporate` | Finance, consulting | Formal, metrics-driven |
| `startup` | Early-stage tech | Impact, ownership, speed |
| `creative` | Design, marketing | Portfolio voice, personality |
| `executive` | C-suite | Leadership, P&L, strategy |
| `minimalist` | ATS-first | Dense facts, no fluff |
| `modern-tech` | Engineering | Stack, systems, scale |
| `luxury` | Hospitality, premium brands | Refined, service excellence |
| `futuristic` | AI/robotics | Innovation, emerging tech |

## Source Adapters

| Adapter | Input | Output |
|---------|-------|--------|
| `prompt` | Free text | Structured CV sections |
| `pdf` | Uploaded PDF | Parsed text → sections |
| `linkedin` | Profile URL/export | Experience, skills, headline |
| `github` | Username | Projects, languages, contributions |
| `portfolio` | Website URL | Scraped bio + projects |
| `job-description` | JD text/URL | Tailored CV + match score |

Each adapter implements:

```typescript
interface SourceAdapter {
  id: string;
  parse(input: unknown): Promise<ParsedSource>;
  validate(input: unknown): boolean;
}
```

## Prompt Orchestration

1. **System prompt** — role, ATS rules, output JSON schema
2. **Style injection** — tone-specific vocabulary constraints
3. **Context block** — parsed source + research snippets
4. **Job alignment** — optional JD keywords for optimization
5. **Few-shot examples** — retrieved via vector search (similar successful CVs)

## Pipelines

| Pipeline | Steps | Queue? |
|----------|-------|--------|
| `generate-full-cv` | parse → research → generate → normalize → save | Yes if >30s |
| `enhance-section` | load CV → enhance → merge | No |
| `optimize-for-job` | load CV + JD → gap analysis → rewrite | No |
| `design-intelligence` | canvas JSON → layout analysis → fix suggestions | No |
| `generate-template` | style brief → layout JSON → preview render | Yes |
| `career-roadmap` | profile + goals → multi-step plan | Yes |

## Vector Search (pgvector)

**Embeddings:** `text-embedding-3-small` (1536 dims)

| Collection | Purpose |
|------------|---------|
| `resume_embeddings` | Semantic search user's past CVs |
| `template_embeddings` | "Find templates like this" |
| `skill_embeddings` | Trending skills clustering |
| `ai_memory` | User preferences, past edits |

Query pattern:

```sql
SELECT id, title, 1 - (embedding <=> $1) AS similarity
FROM templates
WHERE is_public = true
ORDER BY embedding <=> $1
LIMIT 10;
```

## AI Memory System

Per-user memory stored in `ai_generations` + Redis cache:

- Preferred tone style
- Industries/roles
- Rejected suggestions (negative feedback)
- Successful bullet patterns

Retrieved and injected into system prompt (max 500 tokens).

## Recommendation Engine

1. **Collaborative:** Users who used template X also used Y
2. **Content-based:** Vector similarity on CV content
3. **Trending:** Time-decayed template usage + marketplace ratings
4. **Market-aware:** Skills from `job_market_snapshots` table

## Model Strategy

| Task | Model | Rationale |
|------|-------|-----------|
| Generation | gpt-4o | Quality for full CV |
| Enhance/rewrite | gpt-4o-mini | Cost/latency balance |
| Design critique | gpt-4o-mini | Structured JSON output |
| Embeddings | text-embedding-3-small | Cost |
| Research summary | gpt-4o-mini | Summarize web results |

## Streaming

Client receives SSE from `/api/v1/ai/stream`:

```
event: section
data: {"type":"experience","index":0,"content":{...}}

event: done
data: {"resumeId":"..."}
```

## Abuse Prevention

- Token budget per plan (free: 0, basic: 25 runs, pro: unlimited with fair use)
- Max input size: 50KB text, 10MB PDF
- Content moderation via OpenAI moderation API
- Rate limit: 10 AI requests/minute (Redis)

## Implementation Files

- `lib/enterprise/ai/orchestrator.ts` — main entry
- `lib/enterprise/ai/tone-styles.ts` — style definitions
- `lib/enterprise/ai/embeddings.ts` — vector operations
- `lib/enterprise/ai/design-intelligence.ts` — layout analysis
- `lib/enterprise/research/research-engine.ts` — internet data
