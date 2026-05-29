"use client";

/**
 * Thin wrapper — delegates to the singleton in lib/analytics/posthog.ts.
 * @deprecated Prefer trackEvent / initPostHog from @/lib/analytics
 */
export {
  getPostHogInstance as getPostHogClientSync,
  initPostHog as initPostHogClient,
} from "@/lib/analytics/posthog";
