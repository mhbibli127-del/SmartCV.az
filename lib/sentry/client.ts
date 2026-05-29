import * as Sentry from "@sentry/nextjs";
import { getClientSentryOptions, isSentryEnabled } from "@/lib/sentry/options";

let initialized = false;

/** Client-side Sentry init — called once from instrumentation-client.ts */
export function initSentryClient(): void {
  if (initialized || !isSentryEnabled()) return;

  try {
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
  } catch (err) {
    console.error("[sentry] client init failed", err);
  }
}

/** Safe export for instrumentation-client — undefined when Sentry is off or init failed. */
export function getRouterTransitionCapture():
  | typeof Sentry.captureRouterTransitionStart
  | undefined {
  if (!initialized || !isSentryEnabled()) return undefined;
  try {
    return Sentry.captureRouterTransitionStart;
  } catch {
    return undefined;
  }
}

export { Sentry };
