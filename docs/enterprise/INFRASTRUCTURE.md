# Infrastructure & Scaling

## Production Stack

| Component | Service | Purpose |
|-----------|---------|---------|
| App | Vercel Pro / AWS ECS | Next.js 15 |
| Database | Supabase PostgreSQL | Primary data |
| Vector | pgvector extension | Embeddings |
| Cache | Upstash Redis | Cache, rate limits, pub/sub |
| Storage | Supabase Storage | PDFs, uploads, exports |
| Queue | Inngest or BullMQ + Redis | AI, export jobs |
| CDN | Vercel Edge / Cloudflare | Static assets, exports |
| Email | Resend / SMTP | Transactional |
| Billing | Paddle | Subscriptions |
| AI | OpenAI API | Generation |
| Research | Tavily API | Web search |
| Monitoring | Sentry + Vercel Analytics | Errors, perf |

## Environment Tiers

```
development  → SQLite + in-memory cache + local queue
staging      → Supabase staging + Upstash + Inngest dev
production   → Supabase prod + Upstash + Inngest prod
```

## Caching Strategy

| Key Pattern | TTL | Invalidation |
|-------------|-----|--------------|
| `templates:catalog:{page}` | 1h | On template publish |
| `skills:trending:{industry}` | 6h | Cron refresh |
| `user:entitlements:{userId}` | 5m | On webhook |
| `resume:{id}:meta` | 30s | On save |
| `research:jd:{hash}` | 24h | Content hash |

Cache-aside pattern in `lib/enterprise/cache/redis.ts`.

## Queue Architecture

```
API Route ──enqueue──► Redis Queue ──worker──► Process
                              │
                              ├── ai-generation
                              ├── pdf-export
                              ├── embedding-index
                              ├── research-fetch
                              └── email-send
```

Heavy operations **never** block HTTP response:
- Full CV generation → job ID + polling/SSE
- PDF export → webhook or poll
- Bulk embedding → background

## Scaling Strategy

### Phase 1 (0–10K users)
- Single Vercel deployment
- Supabase Pro (connection pooling via PgBouncer)
- Upstash Redis serverless

### Phase 2 (10K–100K)
- Separate worker service (Fly.io/Railway)
- Read replicas for analytics queries
- Edge rate limiting

### Phase 3 (100K+)
- Multi-region read replicas
- Dedicated Socket.IO cluster with Redis adapter
- AI request routing with fallback models
- Template CDN with immutable cache headers

## CDN Optimization

- Template preview images: `/_templates/{id}/preview.webp` — immutable 1y
- Exported PDFs: signed URLs, 7-day expiry
- Font subsets: self-hosted WOFF2 in `/public/fonts`

## Database Connection Pooling

```env
DATABASE_URL="postgresql://..."        # Direct (migrations)
DATABASE_URL_POOLED="postgresql://..." # App runtime (PgBouncer)
```

Prisma: use pooled URL in production with `connection_limit=10`.

## Feature Flags

Stored in `feature_flags` table, cached in Redis:

```typescript
await featureFlags.isEnabled("marketplace", userId);
```

Admin UI at `/admin/feature-flags`.

## Observability

- **Structured logs:** JSON with `requestId`, `userId`, `duration`
- **Metrics:** AI tokens used, export latency p95, queue depth
- **Alerts:** Webhook failures, queue backlog >100, error rate >1%
- **Tracing:** OpenTelemetry → Datadog (optional)

## Security Infrastructure

- WAF: Cloudflare or Vercel Firewall
- DDoS: Rate limits at edge
- Secrets: Vercel env / AWS Secrets Manager
- Backups: Supabase daily + point-in-time recovery
