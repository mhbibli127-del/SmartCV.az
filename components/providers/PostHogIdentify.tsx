"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { AnalyticsTracker } from "@/lib/analytics/tracker";
import { identifyUser, resetUser } from "@/lib/analytics/posthog";
import { isAnalyticsOptedOut } from "@/lib/utils/analytics/env";

/** Identifies authenticated users in PostHog + legacy tracker. */
export function PostHogIdentify() {
  const { data: session, status } = useSession();
  const lastEmailRef = useRef<string | null>(null);

  useEffect(() => {
    if (status === "loading" || isAnalyticsOptedOut()) return;

    const email = session?.user?.email?.toLowerCase().trim() ?? null;

    if (!email) {
      if (lastEmailRef.current) {
        resetUser();
        AnalyticsTracker.getInstance().resetUser();
      }
      lastEmailRef.current = null;
      return;
    }

    if (email === lastEmailRef.current) return;

    identifyUser(email, {
      email,
      name: session?.user?.name ?? undefined,
    });
    AnalyticsTracker.getInstance().setUserId(email);
    lastEmailRef.current = email;
  }, [session, status]);

  return null;
}
