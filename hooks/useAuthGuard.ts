"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { verifyDashboardSessionOnce } from "@/lib/auth-session-verify";

/**
 * Validates the dashboard session once per tab.
 * - 401 → logout (recoverFromStaleSession)
 * - 403 → OTP redirect
 * - 5xx / network → degraded mode (no login ↔ dashboard redirect loop)
 */
export function useAuthGuard() {
  const { status } = useSession();
  const router = useRouter();
  const startedRef = useRef(false);

  useEffect(() => {
    if (status === "loading" || startedRef.current) return;
    startedRef.current = true;

    void verifyDashboardSessionOnce({ sessionStatus: status, router });
  }, [status, router]);
}
