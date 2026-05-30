"use client";

import type { ReactNode } from "react";
import AuthProvider from "@/components/providers/AuthProvider";
import { ClientErrorHandlers } from "@/components/providers/ClientErrorHandlers";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ClientErrorHandlers />
      <ErrorBoundary homeHref="/" homeLabel="Go home">
        {children}
      </ErrorBoundary>
    </AuthProvider>
  );
}
