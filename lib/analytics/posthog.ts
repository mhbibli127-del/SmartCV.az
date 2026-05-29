import type { PostHog } from "posthog-js";
import {
  getPostHogKey,
  isAnalyticsOptedOut,
  isPostHogConfigured,
} from "@/lib/utils/analytics/env";
import { getPostHogInitOptions } from "@/lib/utils/analytics/posthog-config";
import { sanitizeAnalyticsProperties } from "@/lib/utils/analytics/sanitize";

let instance: PostHog | null = null;
let initPromise: Promise<PostHog | null> | null = null;

type InitCallbacks = {
  onLoaded?: () => void;
  onFailed?: () => void;
};

/** Browser-only singleton init — safe to call multiple times. */
export async function initPostHog(
  callbacks?: InitCallbacks
): Promise<PostHog | null> {
  if (typeof window === "undefined") return null;
  if (!isPostHogConfigured() || isAnalyticsOptedOut()) return null;

  const key = getPostHogKey();
  if (!key) return null;

  if (instance?.__loaded) return instance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const { default: posthog } = await import("posthog-js");

      if (!posthog.__loaded) {
        posthog.init(
          key,
          getPostHogInitOptions({
            onLoaded: callbacks?.onLoaded,
            onFailed: callbacks?.onFailed,
          })
        );
      }

      instance = posthog;
      return posthog;
    } catch {
      return null;
    }
  })();

  try {
    return await initPromise;
  } finally {
    initPromise = null;
  }
}

/** Sync accessor after init — returns null on server or before load. */
export function getPostHogInstance(): PostHog | null {
  if (typeof window === "undefined") return null;
  if (!isPostHogConfigured() || isAnalyticsOptedOut()) return null;
  return instance;
}

export function trackEvent(
  name: string,
  properties?: Record<string, unknown>
): void {
  try {
    if (typeof window === "undefined") return;
    if (!isPostHogConfigured() || isAnalyticsOptedOut()) return;

    const props = sanitizeAnalyticsProperties(properties ?? {});
    const client = getPostHogInstance();

    if (client?.__loaded) {
      client.capture(name, props);
      return;
    }

    void initPostHog().then((ph) => {
      ph?.capture(name, props);
    });
  } catch {
    /* silent fail */
  }
}

export function identifyUser(
  id: string,
  properties?: Record<string, unknown>
): void {
  try {
    if (typeof window === "undefined") return;
    if (!isPostHogConfigured() || isAnalyticsOptedOut()) return;

    const distinctId = id.trim();
    if (!distinctId) return;

    const props = sanitizeAnalyticsProperties(properties ?? {});
    const client = getPostHogInstance();

    if (client?.__loaded) {
      client.identify(distinctId, props);
      return;
    }

    void initPostHog().then((ph) => {
      ph?.identify(distinctId, props);
    });
  } catch {
    /* silent fail */
  }
}

export function resetUser(): void {
  try {
    if (typeof window === "undefined") return;
    if (!isPostHogConfigured()) return;
    getPostHogInstance()?.reset();
  } catch {
    /* silent fail */
  }
}

/** Sample helper — use for CTA / button analytics without spamming. */
export function trackButtonClicked(
  buttonName: string,
  properties?: Record<string, unknown>
): void {
  trackEvent("button_clicked", {
    button_name: buttonName,
    ...properties,
  });
}
