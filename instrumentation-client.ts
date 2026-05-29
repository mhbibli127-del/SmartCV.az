// Client-side Sentry initialization (App Router).
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import { getRouterTransitionCapture, initSentryClient } from "@/lib/sentry/client";

try {
  initSentryClient();
} catch (err) {
  console.error("[instrumentation-client] init failed", err);
}

export const onRouterTransitionStart = getRouterTransitionCapture();
