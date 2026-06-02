"use client";

import type { ReactNode } from "react";
import AuthProvider from "@/components/providers/AuthProvider";
import { ClientErrorHandlers } from "@/components/providers/ClientErrorHandlers";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ClientErrorHandlers />
        <ErrorBoundary homeHref="/" homeLabel="Go home">
          {children}
        </ErrorBoundary>
      </AuthProvider>
    </LanguageProvider>
  );
}
