"use client";

import { PostHogBootstrap } from "@/components/providers/PostHogBootstrap";
import { PostHogPageView } from "@/components/providers/PostHogPageView";
import { PostHogIdentify } from "@/components/providers/PostHogIdentify";
import { isPostHogConfigured } from "@/lib/utils/analytics/env";

/** Runs PostHog bootstrap, pageviews, and user identify after auth. */
export function PostHogSessionBridge() {
  if (!isPostHogConfigured()) return null;

  return (
    <>
      <PostHogBootstrap />
      <PostHogPageView />
      <PostHogIdentify />
    </>
  );
}
