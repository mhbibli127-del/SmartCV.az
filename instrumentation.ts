/**
 * Next.js instrumentation hook.
 *
 * - Initializes Sentry for Node.js and Edge runtimes
 * - Validates server environment on startup
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
import * as Sentry from "@sentry/nextjs";
import {
  getEdgeSentryOptions,
  getServerSentryOptions,
  getSentryDsn,
} from "@/lib/sentry/options";

export async function register() {
  const dsn = getSentryDsn();

  if (dsn) {
    if (process.env.NEXT_RUNTIME === "nodejs") {
      Sentry.init(getServerSentryOptions());
    }

    if (process.env.NEXT_RUNTIME === "edge") {
      Sentry.init(getEdgeSentryOptions());
    }
  }

  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // Skip env banner during static build — avoids noisy logs and side effects.
  if (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.NEXT_PHASE === "phase-export"
  ) {
    return;
  }

  const { assertServerEnv } = await import("@/lib/env");
  assertServerEnv();
}

/** Captures errors from Server Components, middleware, and route handlers. */
export const onRequestError = Sentry.captureRequestError;
