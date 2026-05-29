"use client";

import type { ReactNode } from "react";
import AuthProvider from "@/components/providers/AuthProvider";
import { PostHogAnalyticsProvider } from "@/components/providers/PostHogAnalyticsProvider";
import { PostHogSessionBridge } from "@/components/providers/PostHogSessionBridge";
import { ClientErrorHandlers } from "@/components/providers/ClientErrorHandlers";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PostHogAnalyticsProvider>
      <AuthProvider>
        <ClientErrorHandlers />
        <PostHogSessionBridge />
        <ErrorBoundary homeHref="/" homeLabel="Go home">
          {children}
        </ErrorBoundary>
      </AuthProvider>
    </PostHogAnalyticsProvider>
  );
}
