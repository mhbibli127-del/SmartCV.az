"use client";

import { useEffect, type ReactNode } from "react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import {
  getPostHogHost,
  getPostHogKey,
  isAnalyticsOptedOut,
  isPostHogConfigured,
} from "@/lib/utils/analytics/env";

interface PostHogAnalyticsProviderProps {
  children: ReactNode;
}

/**
 * SSR-safe PostHog wrapper — init + provider only.
 * Session identify/pageviews run inside AuthProvider via PostHogSessionBridge.
 */
export function PostHogAnalyticsProvider({ children }: PostHogAnalyticsProviderProps) {
  useEffect(() => {
    if (!isPostHogConfigured() || isAnalyticsOptedOut()) return;
    if (posthog.__loaded) return;

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
  }, []);

  if (!isPostHogConfigured()) {
    return <>{children}</>;
  }

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
