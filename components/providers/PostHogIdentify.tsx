"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePostHog } from "posthog-js/react";
import { AnalyticsTracker } from "@/lib/analytics/tracker";
import { isAnalyticsOptedOut } from "@/lib/utils/analytics/env";

/** Identifies authenticated users in PostHog + legacy tracker. */
export function PostHogIdentify() {
  const { data: session, status } = useSession();
  const posthog = usePostHog();

  useEffect(() => {
    if (status === "loading" || isAnalyticsOptedOut()) return;

    const email = session?.user?.email?.toLowerCase().trim();
    if (!email) {
      posthog?.reset();
      AnalyticsTracker.getInstance().resetUser();
      return;
    }

    posthog?.identify(email, {
      email,
      name: session?.user?.name ?? undefined,
    });
    AnalyticsTracker.getInstance().setUserId(email);
  }, [session, status, posthog]);

  return null;
}
