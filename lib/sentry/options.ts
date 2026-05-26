/** Shared Sentry configuration — server, edge, and client. */

const DEFAULT_DSN =
  "https://e8d9527924809c8a8bd3a8a283df81ab@o4511455695011840.ingest.us.sentry.io/4511455702286336";

export function getSentryDsn(): string | undefined {
  const dsn =
    process.env.SENTRY_DSN?.trim() ||
    process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
  if (dsn && dsn.length > 8) return dsn;
  if (process.env.NODE_ENV === "production") return DEFAULT_DSN;
  return DEFAULT_DSN;
}

export function getSentryEnvironment(): string {
  return (
    process.env.SENTRY_ENVIRONMENT?.trim() ||
    process.env.VERCEL_ENV ||
    process.env.NODE_ENV ||
    "development"
  );
}

export function getServerSentryOptions() {
  return {
    dsn: getSentryDsn(),
    environment: getSentryEnvironment(),
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
    enableLogs: true,
    sendDefaultPii: true,
  };
}

export function getEdgeSentryOptions() {
  return {
    ...getServerSentryOptions(),
  };
}
