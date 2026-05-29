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
  try {
    if (isSentryEnabled()) {
      if (process.env.NEXT_RUNTIME === "nodejs") {
        Sentry.init(getServerSentryOptions());
      }

      if (process.env.NEXT_RUNTIME === "edge") {
        Sentry.init(getEdgeSentryOptions());
      }
    }
  } catch (err) {
    console.error("[instrumentation] Sentry init failed", err);
  }

  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  if (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.NEXT_PHASE === "phase-export"
  ) {
    return;
  }

  try {
    const { assertServerEnv } = await import("@/lib/env");
    assertServerEnv();
  } catch (err) {
    console.error("[instrumentation] env check failed", err);
  }
}

/** Captures errors from Server Components, middleware, and route handlers. */
export const onRequestError = isSentryEnabled()
  ? (...args: Parameters<typeof Sentry.captureRequestError>) => {
      try {
        return Sentry.captureRequestError(...args);
      } catch (err) {
        console.error("[instrumentation] captureRequestError failed", err);
      }
    }
  : undefined;
