/** Shared Sentry configuration — server, edge, and client. */
import type { BrowserOptions, EdgeOptions, NodeOptions } from "@sentry/nextjs";

const PLACEHOLDER_FRAGMENTS = ["your_", "changeme", "xxx", "placeholder"];

function isPlaceholder(value: string): boolean {
  const lower = value.toLowerCase();
  return PLACEHOLDER_FRAGMENTS.some((p) => lower.includes(p));
}

/** True when a valid DSN is configured (no hardcoded fallback). */
export function isSentryEnabled(): boolean {
  return Boolean(getSentryDsn());
}

/**
 * DSN for runtime SDK init.
 * Server prefers SENTRY_DSN; client uses NEXT_PUBLIC_SENTRY_DSN (inlined at build).
 */
export function getSentryDsn(): string | undefined {
  const raw =
    (typeof window === "undefined"
      ? process.env.SENTRY_DSN?.trim() || process.env.NEXT_PUBLIC_SENTRY_DSN?.trim()
      : process.env.NEXT_PUBLIC_SENTRY_DSN?.trim()) ?? "";

  if (!raw || isPlaceholder(raw)) return undefined;
  if (!raw.startsWith("https://")) return undefined;
  return raw;
}

/** Vercel-aware environment: production | preview | development */
export function getSentryEnvironment(): string {
  return (
    process.env.SENTRY_ENVIRONMENT?.trim() ||
    process.env.NEXT_PUBLIC_VERCEL_ENV?.trim() ||
    process.env.VERCEL_ENV?.trim() ||
    process.env.NODE_ENV ||
    "development"
  );
}

/**
 * Release id for grouping — matches source map upload in next.config.
 * Vercel sets VERCEL_GIT_COMMIT_SHA automatically on deploy.
 */
export function getSentryRelease(): string | undefined {
  const explicit =
    process.env.SENTRY_RELEASE?.trim() ||
    process.env.NEXT_PUBLIC_SENTRY_RELEASE?.trim() ||
    process.env.VERCEL_GIT_COMMIT_SHA?.trim();

  if (explicit) return explicit;

  const version = process.env.npm_package_version?.trim() || "1.0.0";
  return `smartcv-az@${version}`;
}

function getTracesSampleRate(): number {
  const env = getSentryEnvironment();
  if (env === "development") return 1;
  if (env === "preview") return 0.2;
  return 0.1;
}

type BaseOptions = Pick<
  NodeOptions,
  "dsn" | "environment" | "release" | "tracesSampleRate" | "debug" | "sendDefaultPii"
>;

function getBaseOptions(): BaseOptions | null {
  const dsn = getSentryDsn();
  if (!dsn) return null;

  return {
    dsn,
    environment: getSentryEnvironment(),
    release: getSentryRelease(),
    tracesSampleRate: getTracesSampleRate(),
    debug: false,
    sendDefaultPii: false,
  };
}

const IGNORED_ERRORS = [
  "ResizeObserver loop",
  "Non-Error promise rejection captured",
  "Loading chunk",
  "ChunkLoadError",
];

export function getServerSentryOptions(): NodeOptions {
  const base = getBaseOptions();
  if (!base) {
    return { enabled: false };
  }

  return {
    ...base,
    enableLogs: base.environment === "development",
    ignoreErrors: IGNORED_ERRORS,
  };
}

export function getEdgeSentryOptions(): EdgeOptions {
  const base = getBaseOptions();
  if (!base) {
    return { enabled: false };
  }

  return {
    ...base,
    ignoreErrors: IGNORED_ERRORS,
  };
}

export function getClientSentryOptions(): BrowserOptions {
  const base = getBaseOptions();
  if (!base) {
    return { enabled: false };
  }

  // Avoid noisy /monitoring 500s during local dev (tunnel is production-only).
  if (
    base.environment === "development" &&
    process.env.NEXT_PUBLIC_SENTRY_DEV !== "true"
  ) {
    return { enabled: false };
  }

  return {
    ...base,
    enableLogs: base.environment === "development",
    ignoreErrors: IGNORED_ERRORS,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: base.environment === "production" ? 1 : 0,
  };
}
