"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { verifyDashboardSessionOnce } from "@/lib/auth-session-verify";

/**
 * Validates the dashboard session once per tab.
 * - 401 → full logout + hard redirect (no middleware loop)
 * - 403 → OTP redirect
 * - 5xx / network → degraded mode (stay on dashboard)
 */
export function useAuthGuard() {
  const { status } = useSession();
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  const ranForStatusRef = useRef<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (ranForStatusRef.current === status) return;
    ranForStatusRef.current = status;

    void verifyDashboardSessionOnce({
      sessionStatus: status,
      router: routerRef.current,
    });
  }, [status]);
}
