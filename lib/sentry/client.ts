import * as Sentry from "@sentry/nextjs";
import { getClientSentryOptions, isSentryEnabled } from "@/lib/sentry/options";

let initialized = false;

/** Client-side Sentry init — called once from instrumentation-client.ts */
export function initSentryClient(): void {
  if (initialized || !isSentryEnabled()) return;

  const options = getClientSentryOptions();
  if (options.enabled === false) return;

  Sentry.init({
    ...options,
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
  });

  initialized = true;
}

export { Sentry };
