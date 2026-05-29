/**
 * Next.js instrumentation hook — Sentry server/edge + env validation.
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
 */
import * as Sentry from "@sentry/nextjs";
import {
  getEdgeSentryOptions,
  getServerSentryOptions,
  isSentryEnabled,
} from "@/lib/sentry/options";

export async function register() {
  if (isSentryEnabled()) {
    if (process.env.NEXT_RUNTIME === "nodejs") {
      Sentry.init(getServerSentryOptions());
    }

    if (process.env.NEXT_RUNTIME === "edge") {
      Sentry.init(getEdgeSentryOptions());
    }
  }

  if (process.env.NEXT_RUNTIME !== "nodejs") return;

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
export const onRequestError = isSentryEnabled()
  ? Sentry.captureRequestError
  : undefined;
