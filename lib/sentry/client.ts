import * as Sentry from "@sentry/nextjs";
import { getSentryDsn } from "@/lib/sentry/options";

/** Client-side Sentry init — used by instrumentation-client.ts */
export function initSentryClient(): void {
  const dsn = getSentryDsn();
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment:
      process.env.NEXT_PUBLIC_VERCEL_ENV ||
      process.env.NODE_ENV ||
      "development",
    integrations: [Sentry.replayIntegration()],
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
    enableLogs: true,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    sendDefaultPii: true,
  });
}

export { Sentry };
