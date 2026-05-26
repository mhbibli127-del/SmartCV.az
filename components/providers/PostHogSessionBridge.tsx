"use client";

import { PostHogPageView } from "@/components/providers/PostHogPageView";
import { PostHogIdentify } from "@/components/providers/PostHogIdentify";

/** Runs PostHog identify + pageviews after auth session is available. */
export function PostHogSessionBridge() {
  return (
    <>
      <PostHogPageView />
      <PostHogIdentify />
    </>
  );
}
