/**
 * Client-safe Sentry capture — never throws if SDK is missing or misconfigured.
 */
export function captureExceptionSafe(error: unknown): void {
  if (typeof window === "undefined") return;

  try {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
    if (!dsn || dsn.length < 12) return;

    void import("@sentry/nextjs")
      .then((Sentry) => {
        Sentry.captureException(error);
      })
      .catch(() => {
        /* Sentry unavailable — ignore */
      });
  } catch {
    /* ignore */
  }
}
