"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics/posthog";
import { isAnalyticsOptedOut, isPostHogConfigured } from "@/lib/utils/analytics/env";

/** Fires once per session when analytics is ready. */
export function PostHogBootstrap() {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    if (!isPostHogConfigured() || isAnalyticsOptedOut()) return;

    firedRef.current = true;
    trackEvent("app_loaded", {
      environment: process.env.NODE_ENV ?? "development",
    });
  }, []);

  return null;
}
