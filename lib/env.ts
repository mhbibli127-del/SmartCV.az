/**
 * Server-side environment validation.
 *
 * IMPORTANT: Never import this from client components. All helpers in this
 * module read process.env and return secret values where appropriate.
 */

import { isBuildPhase } from "@/lib/build";

function sqliteFileUrl(relativeFile: string): string {
  const normalized = relativeFile.replace(/^\.\//, "");
  return `file:${process.cwd()}/prisma/${normalized}`;
}

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

export function getCloudinaryCloudName(): string | null {
  return readSecret("CLOUDINARY_CLOUD_NAME");
}

export function getCloudinaryApiKey(): string | null {
  return readSecret("CLOUDINARY_API_KEY");
}

export function getCloudinaryApiSecret(): string | null {
  return readSecret("CLOUDINARY_API_SECRET");
}

/** Safe for client-side CDN URL building — no secrets exposed. */
export function getPublicCloudinaryCloudName(): string | null {
  return (
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() ||
    getCloudinaryCloudName()
  );
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    getCloudinaryCloudName() &&
      getCloudinaryApiKey() &&
      getCloudinaryApiSecret()
  );
}

export function getPostHogKey(): string | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
  if (!key || isPlaceholder(key)) return null;
  return key;
}

export function isPostHogConfigured(): boolean {
  return Boolean(getPostHogKey());
}

export function getLeonardoApiKey(): string | null {
  return readSecret("LEONARDO_API_KEY");
}

export function getLeonardoModelId(): string | null {
  return readSecret("LEONARDO_MODEL_ID");
}

export function isLeonardoConfigured(): boolean {
  return Boolean(getLeonardoApiKey());
}

export function getPineconeApiKey(): string | null {
  return readSecret("PINECONE_API_KEY");
}

export function getPineconeIndex(): string | null {
  const index = process.env.PINECONE_INDEX?.trim();
  return index && !isPlaceholder(index) ? index : null;
}

export function isPineconeConfigured(): boolean {
  return Boolean(getPineconeApiKey() && getPineconeIndex());
}

export function getLiveblocksSecretKey(): string | null {
  return readSecret("LIVEBLOCKS_SECRET_KEY");
}

export function getLiveblocksPublicKey(): string | null {
  const key = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY?.trim();
  if (!key || isPlaceholder(key)) return null;
  return key;
}

export function isLiveblocksConfigured(): boolean {
  return Boolean(getLiveblocksSecretKey() && getLiveblocksPublicKey());
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
  try {
    return requireMongoUri();
  } catch {
    return null;
  }
}

/** Redact credentials from a MongoDB URI for safe logging. */
export function maskMongoUri(uri: string): string {
  return uri.replace(/\/\/([^@/]+)@/, "//***@");
}

/**
 * Normalize common misconfigurations (e.g. duplicated "MONGODB_URI=" prefix).
 */
function normalizeMongoUri(raw: string): string {
  let uri = raw.trim();
  while (/^MONGODB_URI=/i.test(uri)) {
    uri = uri.replace(/^MONGODB_URI=/i, "").trim();
  }
  return uri;
}

/**
 * Returns a validated MongoDB connection string.
 * @throws {Error} "MONGODB_URI is not defined" when missing/empty/placeholder
 * @throws {Error} when URI scheme is not mongodb:// or mongodb+srv://
 */
export function requireMongoUri(): string {
  const raw = process.env.MONGODB_URI?.trim();

  if (!raw) {
    throw new Error("MONGODB_URI is not defined");
  }

  const uri = normalizeMongoUri(raw);

  if (!uri || isPlaceholder(uri)) {
    throw new Error("MONGODB_URI is not defined");
  }

  if (!/^mongodb(\+srv)?:\/\//i.test(uri)) {
    throw new Error(
      `Invalid MongoDB URI scheme — expected mongodb:// or mongodb+srv://. ` +
        `Got: ${maskMongoUri(uri)}`
    );
  }

  return uri;
}

export function getOpenAIKey(): string | null {
  return readSecret("OPENAI_API_KEY");
}

/**
 * SQLite URL for Prisma. Relative `file:./dev.db` is resolved against
 * `prisma/` (Prisma convention). Rejects accidental MongoDB URIs in
 * DATABASE_URL — that belongs in MONGODB_URI.
 */
export function getDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL?.trim();

  if (raw?.startsWith("postgresql://") || raw?.startsWith("postgres://")) {
    return raw;
  }

  if (raw?.startsWith("mongodb")) {
    // eslint-disable-next-line no-console
    console.warn(
      "[env] DATABASE_URL looks like MongoDB — using prisma/dev.db instead. " +
        "Set MONGODB_URI for MongoDB and DATABASE_URL=file:./dev.db for Prisma."
    );
    return sqliteFileUrl("dev.db");
  }

  if (raw?.startsWith("file:")) {
    const filePath = raw.slice("file:".length);
    if (filePath.startsWith("/") || /^[A-Za-z]:/.test(filePath)) return raw;
    const normalized = filePath.replace(/^\.\//, "");
    return sqliteFileUrl(normalized);
  }

  return sqliteFileUrl("dev.db");
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

/** NextAuth signing secret — never throws during build. */
export function getNextAuthSecret(): string {
  const secret = readSecret("NEXTAUTH_SECRET") ?? readSecret("JWT_SECRET");
  if (secret) return secret;

  if (isBuildPhase()) {
    return "build-phase-placeholder-not-used-at-runtime";
  }

  if (process.env.NODE_ENV === "production") {
    // eslint-disable-next-line no-console
    console.warn(
      "[env] NEXTAUTH_SECRET is missing in production. " +
        "Set NEXTAUTH_SECRET in Vercel environment variables."
    );
    return "missing-nextauth-secret-configure-in-vercel";
  }

  if (!jwtFallbackWarned) {
    jwtFallbackWarned = true;
    // eslint-disable-next-line no-console
    console.warn(
      "[env] NEXTAUTH_SECRET is not configured. Using a development-only fallback."
    );
  }
  return DEV_JWT_FALLBACK;
}

export function getNextAuthUrl(): string {
  return (
    process.env.NEXTAUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "http://localhost:3000"
  );
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
  {
    name: "CLOUDINARY_CLOUD_NAME",
    read: () => (isCloudinaryConfigured() ? getCloudinaryCloudName() : null),
  },
  {
    name: "NEXT_PUBLIC_POSTHOG_KEY",
    read: getPostHogKey,
  },
  { name: "PINECONE_API_KEY", read: () => (isPineconeConfigured() ? getPineconeApiKey() : null) },
  { name: "LEONARDO_API_KEY", read: getLeonardoApiKey },
  {
    name: "LIVEBLOCKS_SECRET_KEY",
    read: () => (isLiveblocksConfigured() ? getLiveblocksSecretKey() : null),
  },
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
