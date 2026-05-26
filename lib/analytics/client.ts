"use client";

import type { PostHog } from "posthog-js";
import {
  getPostHogHost,
  getPostHogKey,
  isAnalyticsOptedOut,
  isPostHogConfigured,
} from "@/lib/utils/analytics/env";

let posthogClient: PostHog | null = null;

/**
 * Lazy, client-only PostHog initialization for imperative capture outside React.
 */
export async function initPostHogClient(): Promise<PostHog | null> {
  if (typeof window === "undefined") return null;
  if (!isPostHogConfigured() || isAnalyticsOptedOut()) return null;

  const { default: posthog } = await import("posthog-js");

  if (!posthog.__loaded) {
    posthog.init(getPostHogKey()!, {
      api_host: getPostHogHost(),
      person_profiles: "identified_only",
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: false,
      persistence: "localStorage+cookie",
      disable_session_recording: process.env.NODE_ENV === "development",
      respect_dnt: true,
    });
  }

  posthogClient = posthog;
  return posthog;
}

export function getPostHogClientSync(): PostHog | null {
  if (typeof window === "undefined" || isAnalyticsOptedOut()) return null;
  return posthogClient;
}
