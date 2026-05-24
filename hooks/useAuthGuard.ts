"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  hasAuthStateCookie,
  recoverFromStaleSession,
  shouldFetchAuthenticatedApis,
} from "@/lib/auth-client";

/**
 * Validates the dashboard session once on mount.
 * - NextAuth (Google) users get JWT cookies bridged via POST /api/auth/me
 * - Email/password users get a single /api/auth/me check
 * - Only 401 triggers full logout (403 = redirect to OTP, not logout)
 */
export function useAuthGuard() {
  const { status } = useSession();
  const router = useRouter();
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current || status === "loading") return;

    async function verify() {
      // NextAuth session → bridge to JWT cookies
      if (status === "authenticated") {
        if (!hasAuthStateCookie()) {
          const bridge = await fetch("/api/auth/me", {
            method: "POST",
            credentials: "include",
          });
          if (!bridge.ok) {
            router.replace("/login");
            return;
          }
        }
        checked.current = true;
        return;
      }

      // Email/password session
      if (!shouldFetchAuthenticatedApis(status)) {
        router.replace("/login");
        return;
      }

      const res = await fetch("/api/auth/me", { credentials: "include" });

      if (res.status === 401) {
        await recoverFromStaleSession();
        return;
      }

      if (res.status === 403) {
        const data = await res.json().catch(() => ({}));
        router.replace(data.redirect ?? "/verify-otp");
        return;
      }

      checked.current = true;
    }

    verify().catch(() => {
      /* network blip */
    });
  }, [status, router]);
}
