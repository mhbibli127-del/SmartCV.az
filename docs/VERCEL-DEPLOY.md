# Vercel Deployment Checklist — SmartCV.AZ

Use this before and after your first production deploy.

## 1. Prerequisites

- [ ] Vercel account linked to GitHub (or CLI: `vercel link`)
- [ ] Supabase project with PostgreSQL enabled
- [ ] Node **18.18+** (set in Vercel → Settings → General if needed)

## 2. Required environment variables

Set in **Vercel → Project → Settings → Environment Variables** (Production + Preview):

| Variable | Notes |
|----------|--------|
| `DATABASE_URL` | Supabase **pooler** URL, port **6543**, `?pgbouncer=true` |
| `DIRECT_URL` | Supabase **direct** URL, port **5432** (Prisma migrations) |
| `JWT_SECRET` | Random 32+ char secret |
| `NEXTAUTH_SECRET` | Random 32+ char secret |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` (or custom domain) |
| `NEXT_PUBLIC_APP_URL` | Same as production URL |

Generate secrets:

```bash
openssl rand -base64 32
```

## 3. Strongly recommended

| Variable | Why |
|----------|-----|
| `CLOUDINARY_*` | PDF/thumbnail exports persist on Vercel (local `public/resumes/` is ephemeral) |
| `OPENAI_API_KEY` | AI generator + PDF import |
| `EMAIL_*` | OTP / verification emails |

## 4. Optional

| Variable | Feature |
|----------|---------|
| `MONGODB_URI` | Legacy `/api/cv/*` + analytics (core Studio uses Prisma only) |
| `GOOGLE_CLIENT_ID/SECRET` | Google OAuth |
| `NEXT_PUBLIC_POSTHOG_KEY` | Product analytics |
| `SENTRY_DSN` | Error monitoring |

## 5. Database setup

```bash
# One-time: apply schema to Supabase (uses DIRECT_URL)
npx prisma migrate deploy
```

If migrations fail, run `npx prisma db push` once in dev, then use migrations going forward.

**Supabase password reset:** If you see `ECIRCUITBREAKER`, reset the DB password in Supabase and update both URLs. Wait 5–15 minutes before retrying.

## 6. Local verification

```bash
npm run verify:vercel   # checks required env (load .env.local first)
npm run type-check
npm run build
```

## 7. Deploy

```bash
vercel --prod
```

Or push to the connected production branch.

**Build settings** (already in `vercel.json`):

- Build: `npm run build`
- Install: `npm install --include=dev` (needs `prisma` devDependency)

## 8. Post-deploy smoke test

- [ ] `GET /api/health` → `postgres: ok` (or `circuit_open` if DB misconfigured)
- [ ] Login / register works
- [ ] `/dashboard` loads resume gallery
- [ ] `/dashboard/studio` opens and autosaves
- [ ] Export PDF → thumbnail + download work (requires Cloudinary on Vercel)
- [ ] `/api/mongo-test` returns **404** in production (expected)

## 9. Custom domain

1. Vercel → Domains → add domain
2. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to `https://yourdomain.com`
3. Google OAuth: add redirect URI in Google Cloud Console
4. Redeploy

## 10. Known limits

| Topic | Detail |
|-------|--------|
| **Serverless filesystem** | Do not rely on `public/resumes/` on Vercel — use Cloudinary |
| **Function timeout** | PDF/AI routes set to 60s in `vercel.json` (Pro plan for >10s on Hobby) |
| **Rate limits** | Login/register limited per IP in-memory (resets on cold start) |
| **Dual stack** | Prisma `/api/resumes/*` is primary; Mongo `/api/cv/*` is legacy |

## 11. Troubleshooting

| Symptom | Fix |
|---------|-----|
| Build fails `prisma generate` | Ensure `installCommand` includes devDependencies |
| 503 on save | Fix `DATABASE_URL`, wait for circuit breaker cooldown |
| OAuth redirect mismatch | Match `NEXTAUTH_URL` exactly to browser URL |
| Empty export URLs | Set Cloudinary env vars and redeploy |
| White screen | Check Vercel function logs + Sentry |

---

Copy variables from `.env.example` as a template. Never commit `.env.local`.
