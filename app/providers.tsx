"use client";

import type { ReactNode } from "react";
import AuthProvider from "@/components/providers/AuthProvider";
import { SubscriptionProvider } from "@/components/providers/SubscriptionProvider";
import { PostHogAnalyticsProvider } from "@/components/providers/PostHogAnalyticsProvider";
import { PostHogSessionBridge } from "@/components/providers/PostHogSessionBridge";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PostHogAnalyticsProvider>
      <AuthProvider>
        <PostHogSessionBridge />
        <SubscriptionProvider>{children}</SubscriptionProvider>
      </AuthProvider>
    </PostHogAnalyticsProvider>
  );
}
