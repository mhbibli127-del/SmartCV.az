"use client";

import { useEffect, useState, type ReactNode } from "react";
import { PostHogProvider } from "posthog-js/react";
import {
  getPostHogInstance,
  initPostHog,
} from "@/lib/analytics/posthog";
import {
  isAnalyticsOptedOut,
  isPostHogConfigured,
} from "@/lib/utils/analytics/env";

interface PostHogAnalyticsProviderProps {
  children: ReactNode;
}

/**
 * SSR-safe PostHog wrapper — lazy init + provider only when configured.
 */
export function PostHogAnalyticsProvider({ children }: PostHogAnalyticsProviderProps) {
  const [ready, setReady] = useState(false);
  const configured = isPostHogConfigured();

  useEffect(() => {
    if (!configured || isAnalyticsOptedOut()) return;

    if (getPostHogInstance()?.__loaded) {
      setReady(true);
      return;
    }

    void initPostHog({
      onLoaded: () => setReady(true),
      onFailed: () => {
        getPostHogInstance()?.opt_out_capturing();
        setReady(false);
      },
    });
  }, [configured]);

  const client = ready ? getPostHogInstance() : null;

  if (!configured || !client) {
    return <>{children}</>;
  }

  return <PostHogProvider client={client}>{children}</PostHogProvider>;
}
