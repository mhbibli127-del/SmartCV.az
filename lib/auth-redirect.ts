"use client";

import { clearAuthStateClient } from "@/lib/auth-client";
import { clearAuthVerificationState } from "@/lib/auth-verification-state";
import { clearAuthStorage } from "@/lib/logout";

let forceLogoutInflight = false;

/**
 * Full client logout + hard navigation to login.
 * Prevents middleware ↔ client redirect loops (always clears cookies before /login).
 */
export async function forceLogoutToLogin(
  reason: "session_expired" | "logout" = "session_expired"
): Promise<void> {
  if (typeof window === "undefined" || forceLogoutInflight) return;
  forceLogoutInflight = true;

  clearAuthVerificationState();
  clearAuthStorage();

  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  } catch {
    /* offline */
  }

  try {
    const { signOut } = await import("next-auth/react");
    await signOut({ redirect: false });
  } catch {
    /* no OAuth session */
  }

  const param = reason === "logout" ? "logout=1" : "reason=session_expired";
  window.location.replace(`/login?${param}`);
}
