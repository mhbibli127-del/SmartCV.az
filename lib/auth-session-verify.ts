"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import {
  hasAuthStateCookie,
  recoverFromStaleSession,
  shouldFetchAuthenticatedApis,
} from "@/lib/auth-client";
import { isTransientApiFailure, isUnauthorized, parseJsonSafe } from "@/lib/auth-api-client";

const SESSION_VERIFIED_KEY = "smartcv_auth_verified";
const SESSION_DEGRADED_KEY = "smartcv_auth_degraded";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

let verifyInflight: Promise<void> | null = null;

function markVerified(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_VERIFIED_KEY, "1");
  sessionStorage.removeItem(SESSION_DEGRADED_KEY);
}

function markDegraded(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_DEGRADED_KEY, "1");
}

function alreadyHandledThisTab(): boolean {
  if (typeof window === "undefined") return false;
  return (
    sessionStorage.getItem(SESSION_VERIFIED_KEY) === "1" ||
    sessionStorage.getItem(SESSION_DEGRADED_KEY) === "1"
  );
}

/**
 * Runs once per tab session. On DB/API outage (5xx), stays on dashboard in degraded
 * mode instead of ping-ponging login ↔ dashboard (replaceState infinite loop).
 */
export function verifyDashboardSessionOnce(options: {
  sessionStatus: SessionStatus;
  router: AppRouterInstance;
}): Promise<void> {
  const { sessionStatus, router } = options;

  if (sessionStatus === "loading") {
    return Promise.resolve();
  }

  if (alreadyHandledThisTab()) {
    return Promise.resolve();
  }

  if (verifyInflight) {
    return verifyInflight;
  }

  verifyInflight = (async () => {
    try {
      if (sessionStatus === "authenticated") {
        if (!hasAuthStateCookie()) {
          const bridge = await fetch("/api/auth/me", {
            method: "POST",
            credentials: "include",
          });

          if (bridge.ok) {
            markVerified();
            return;
          }

          if (isUnauthorized(bridge.status)) {
            router.replace("/login");
            return;
          }

          if (isTransientApiFailure(bridge.status)) {
            markDegraded();
            return;
          }

          router.replace("/login");
        } else {
          markVerified();
        }
        return;
      }

      if (!shouldFetchAuthenticatedApis(sessionStatus)) {
        router.replace("/login");
        return;
      }

      const res = await fetch("/api/auth/me", { credentials: "include" });

      if (res.ok) {
        markVerified();
        return;
      }

      if (isUnauthorized(res.status)) {
        await recoverFromStaleSession();
        return;
      }

      if (res.status === 403) {
        const data = await parseJsonSafe<{ redirect?: string }>(res);
        router.replace(data?.redirect ?? "/verify-otp");
        return;
      }

      if (isTransientApiFailure(res.status)) {
        markDegraded();
        return;
      }

      if (!hasAuthStateCookie()) {
        router.replace("/login?reason=session_expired");
        return;
      }

      markDegraded();
    } catch {
      if (hasAuthStateCookie() || sessionStatus === "authenticated") {
        markDegraded();
        return;
      }
      router.replace("/login?reason=session_expired");
    }
  })().finally(() => {
    verifyInflight = null;
  });

  return verifyInflight;
}
