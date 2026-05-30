"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import {
  hasAuthStateCookie,
  shouldFetchAuthenticatedApis,
} from "@/lib/auth-client";
import { forceLogoutToLogin } from "@/lib/auth-redirect";
import { isTransientApiFailure, isUnauthorized, parseJsonSafe } from "@/lib/auth-api-client";
import {
  isAuthVerificationSettled,
  markAuthDegraded,
  markAuthVerified,
} from "@/lib/auth-verification-state";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

let verifyInflight: Promise<void> | null = null;

/**
 * Runs once per tab session. On DB/API outage (5xx), stays on dashboard in degraded
 * mode instead of ping-ponging login ↔ dashboard.
 */
export function verifyDashboardSessionOnce(options: {
  sessionStatus: SessionStatus;
  router: AppRouterInstance;
}): Promise<void> {
  const { sessionStatus, router } = options;

  if (sessionStatus === "loading") {
    return Promise.resolve();
  }

  if (isAuthVerificationSettled()) {
    return Promise.resolve();
  }

  if (verifyInflight) {
    return verifyInflight;
  }

  verifyInflight = (async () => {
    try {
      if (sessionStatus === "authenticated" && !hasAuthStateCookie()) {
        const bridge = await fetch("/api/auth/me", {
          method: "POST",
          credentials: "include",
        });

        if (bridge.ok) {
          markAuthVerified();
          return;
        }

        if (isUnauthorized(bridge.status)) {
          await forceLogoutToLogin("session_expired");
          return;
        }

        if (isTransientApiFailure(bridge.status)) {
          markAuthDegraded();
          return;
        }

        await forceLogoutToLogin("session_expired");
        return;
      }

      if (!shouldFetchAuthenticatedApis(sessionStatus)) {
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/login")
        ) {
          router.replace("/login");
        }
        return;
      }

      const res = await fetch("/api/auth/me", { credentials: "include" });

      if (res.ok) {
        markAuthVerified();
        return;
      }

      if (isUnauthorized(res.status)) {
        await forceLogoutToLogin("session_expired");
        return;
      }

      if (res.status === 403) {
        const data = await parseJsonSafe<{ redirect?: string }>(res);
        const target = data?.redirect ?? "/verify-otp";
        if (typeof window !== "undefined" && window.location.pathname !== target) {
          router.replace(target);
        }
        return;
      }

      if (isTransientApiFailure(res.status)) {
        markAuthDegraded();
        return;
      }

      if (!hasAuthStateCookie()) {
        await forceLogoutToLogin("session_expired");
        return;
      }

      markAuthDegraded();
    } catch {
      if (hasAuthStateCookie() || sessionStatus === "authenticated") {
        markAuthDegraded();
        return;
      }
      await forceLogoutToLogin("session_expired");
    }
  })().finally(() => {
    verifyInflight = null;
  });

  return verifyInflight;
}
