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
| `EMAIL_*` | OTP / verification emails |

## 4. Optional

| Variable | Feature |
|----------|---------|
| `MONGODB_URI` | Legacy `/api/cv/*` + analytics (core Studio uses Prisma only) |
| `GOOGLE_CLIENT_ID/SECRET` | Google OAuth |
| `SENTRY_DSN` | Server error monitoring (optional) |
| `NEXT_PUBLIC_SENTRY_DSN` | Same DSN as above — required for browser errors |
| `SENTRY_AUTH_TOKEN` | Source map upload at build (Production; secret) |
| `SENTRY_ORG` | `smartcv-99` (default if omitted) |
| `SENTRY_PROJECT` | `javascript-nextjs` (default if omitted) |

**Sentry on Vercel:** `VERCEL_GIT_COMMIT_SHA` is set automatically and used as the release name. Without `SENTRY_AUTH_TOKEN`, the app still runs but stack traces stay minified (no build warnings).

## 5. Database setup (Supabase)

| Variable | Host | Port | Notes |
|----------|------|------|--------|
| `DATABASE_URL` | `*.pooler.supabase.com` | **6543** | `?pgbouncer=true` — runtime + Vercel |
| `DIRECT_URL` | `db.*.supabase.co` | **5432** | Migrations only — **not** the pooler host |

Password must appear in both URLs (`postgres.REF:PASSWORD@...`). Encode `@` in passwords as `%40`.

```bash
npm run db:generate
npm run db:validate
npm run db:check          # SELECT 1 via pooler
npm run db:migrate:deploy # applies migrations via DIRECT_URL
```

**Common mistakes:** missing password, `DIRECT_URL` pointing at pooler, `NODE_ENV=production` in `.env.local` during dev.

**Supabase password reset:** If you see `ECIRCUITBREAKER` or `Authentication failed`, reset the DB password in Supabase, update both URLs, wait 5–15 minutes before retrying.

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
| OAuth `redirect_uri_mismatch` | See **Google OAuth (Vercel)** below |

## Google OAuth (Vercel)

`Error 400: redirect_uri_mismatch` means Google Console does not list the exact callback URL NextAuth sends.

1. Open your live site in the browser and copy the origin only, e.g. `https://smart-cv-az.vercel.app` (no trailing `/`).
2. **Vercel → Project → Settings → Environment Variables** (Production):
   - `NEXTAUTH_URL` = that origin (must be `https://`, not `http://localhost:3000`)
   - `NEXT_PUBLIC_APP_URL` = same value
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` = same OAuth client as local dev
3. **Google Cloud Console** → APIs & Services → Credentials → your OAuth 2.0 Client:
   - **Authorized JavaScript origins:** `https://smart-cv-az.vercel.app`
   - **Authorized redirect URIs:** `https://smart-cv-az.vercel.app/api/auth/callback/google`
   - Keep localhost entries for local dev:
     - `http://localhost:3000`
     - `http://localhost:3000/api/auth/callback/google`
4. If you use a **custom domain**, add **both** `*.vercel.app` and `https://yourdomain.com` (+ matching callback URLs).
5. **Redeploy** after changing env vars.
6. Verify: open `https://your-app.vercel.app/api/auth/config` — `callbackUrl` must match the redirect URI in Google Console **character for character**.
| Empty export URLs | Set Cloudinary env vars and redeploy |
| White screen | Check Vercel function logs + Sentry |

---

Copy variables from `.env.example` as a template. Never commit `.env.local`.
