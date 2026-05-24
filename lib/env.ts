/**
 * Server-side environment validation.
 *
 * IMPORTANT: Never import this from client components. All helpers in this
 * module read process.env and return secret values where appropriate.
 *
 * Public helpers:
 *   - getAppUrl()                  -> string (safe, public)
 *   - getStripeSecretKey()         -> string | null
 *   - getStripeWebhookSecret()     -> string | null
 *   - getMongoUri()                -> string | null
 *   - getJwtSecret()               -> string  (throws in prod if missing)
 *   - getOpenAIKey()               -> string | null
 *   - getDatabaseUrl()             -> string  (defaults to local sqlite)
 *   - assertServerEnv()            -> EnvReport  (one-shot startup banner)
 *   - requireEnv(name)             -> string  (throws if missing)
 */

const PLACEHOLDER_PATTERNS = [
  "your_",
  "your-",
  "xxx",
  "changeme",
  "dummy_key",
  "sk_test_...",
  "whsec_...",
  "pk_test_...",
  "smart-cv-secret-key-123",
  "username:password",
];

function isPlaceholder(value: string | undefined): boolean {
  if (!value?.trim()) return true;
  const lower = value.toLowerCase();
  return PLACEHOLDER_PATTERNS.some((p) => lower.includes(p));
}

function readSecret(name: string): string | null {
  const raw = process.env[name]?.trim();
  if (!raw || isPlaceholder(raw)) return null;
  return raw;
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
}

export function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value || isPlaceholder(value)) {
    throw new Error(
      `[env] ${name} is missing or still contains a placeholder value. ` +
        `Set a real value in .env.local.`
    );
  }
  return value;
}

export function getStripeSecretKey(): string | null {
  return readSecret("STRIPE_SECRET_KEY");
}

export function getStripeWebhookSecret(): string | null {
  return readSecret("STRIPE_WEBHOOK_SECRET");
}

export function getMongoUri(): string | null {
  // Accept either MONGODB_URI (preferred) or MONGODB_URL (legacy).
  return readSecret("MONGODB_URI") ?? readSecret("MONGODB_URL");
}

export function getOpenAIKey(): string | null {
  return readSecret("OPENAI_API_KEY");
}

import path from "path";

/**
 * SQLite URL for Prisma. Relative `file:./dev.db` is resolved against
 * `prisma/` (Prisma convention). Rejects accidental MongoDB URIs in
 * DATABASE_URL — that belongs in MONGODB_URI.
 */
export function getDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL?.trim();

  if (raw?.startsWith("mongodb")) {
    // eslint-disable-next-line no-console
    console.warn(
      "[env] DATABASE_URL looks like MongoDB — using prisma/dev.db instead. " +
        "Set MONGODB_URI for MongoDB and DATABASE_URL=file:./dev.db for Prisma."
    );
    return `file:${path.join(process.cwd(), "prisma", "dev.db")}`;
  }

  if (raw?.startsWith("file:")) {
    const filePath = raw.slice("file:".length);
    if (path.isAbsolute(filePath)) return raw;
    // Prisma resolves relative sqlite paths from the schema directory.
    const normalized = filePath.replace(/^\.\//, "");
    return `file:${path.join(process.cwd(), "prisma", normalized)}`;
  }

  return `file:${path.join(process.cwd(), "prisma", "dev.db")}`;
}

/**
 * Returns the JWT signing secret.
 * - In production: throws if missing/placeholder. This is a security boundary.
 * - In development: returns the value if present, otherwise returns a
 *   dev-only fallback and prints a one-time warning.
 */
let jwtFallbackWarned = false;
const DEV_JWT_FALLBACK = "dev-only-fallback-do-not-use-in-production";

export function getJwtSecret(): string {
  const real = readSecret("JWT_SECRET");
  if (real) return real;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "[env] JWT_SECRET is missing or a placeholder in production. " +
        "Set JWT_SECRET to a strong random string in your production environment."
    );
  }

  if (!jwtFallbackWarned) {
    jwtFallbackWarned = true;
    // eslint-disable-next-line no-console
    console.warn(
      "[env] JWT_SECRET is not configured. Using a development-only fallback. " +
        "Set JWT_SECRET in .env.local before deploying."
    );
  }
  return DEV_JWT_FALLBACK;
}

export interface EnvReport {
  ok: boolean;
  missing: string[];
  configured: string[];
  warnings: string[];
}

const REQUIRED_FOR_PROD = [
  { name: "MONGODB_URI", read: getMongoUri },
  { name: "STRIPE_SECRET_KEY", read: getStripeSecretKey },
  { name: "STRIPE_WEBHOOK_SECRET", read: getStripeWebhookSecret },
  { name: "JWT_SECRET", read: () => readSecret("JWT_SECRET") },
];

const OPTIONAL_BUT_RECOMMENDED = [
  { name: "OPENAI_API_KEY", read: getOpenAIKey },
];

let bannerPrinted = false;

/**
 * Validates server env and returns a structured report.
 * Safe to call multiple times — banner is printed at most once per process.
 */
export function assertServerEnv(): EnvReport {
  const missing: string[] = [];
  const configured: string[] = [];
  const warnings: string[] = [];

  for (const { name, read } of REQUIRED_FOR_PROD) {
    if (read()) configured.push(name);
    else missing.push(name);
  }
  for (const { name, read } of OPTIONAL_BUT_RECOMMENDED) {
    if (read()) configured.push(name);
    else warnings.push(`${name} is not configured (optional)`);
  }

  const ok = missing.length === 0;

  if (!bannerPrinted) {
    bannerPrinted = true;
    const isProd = process.env.NODE_ENV === "production";
    // eslint-disable-next-line no-console
    console.log("[env] Environment check:");
    for (const name of configured) {
      // eslint-disable-next-line no-console
      console.log(`  OK     ${name}`);
    }
    for (const name of missing) {
      const msg = `  MISSING ${name}${isProd ? " (REQUIRED IN PRODUCTION)" : ""}`;
      // eslint-disable-next-line no-console
      isProd ? console.error(msg) : console.warn(msg);
    }
    for (const w of warnings) {
      // eslint-disable-next-line no-console
      console.warn(`  WARN   ${w}`);
    }
  }

  return { ok, missing, configured, warnings };
}
