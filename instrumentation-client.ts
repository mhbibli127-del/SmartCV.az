// Client-side Sentry initialization (App Router).
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import { initSentryClient, Sentry } from "@/lib/sentry/client";

initSentryClient();

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
