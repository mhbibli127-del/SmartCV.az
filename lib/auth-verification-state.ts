/**
 * Per-tab client auth verification flags (sessionStorage).
 * Cleared on logout / forced login so guards re-run after a fresh sign-in.
 */

export const SESSION_VERIFIED_KEY = "smartcv_auth_verified";
export const SESSION_DEGRADED_KEY = "smartcv_auth_degraded";
export const SESSION_AUTH_ME_FAILED_KEY = "smartcv_auth_me_failed";

export function markAuthVerified(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_VERIFIED_KEY, "1");
  sessionStorage.removeItem(SESSION_DEGRADED_KEY);
  sessionStorage.removeItem(SESSION_AUTH_ME_FAILED_KEY);
}

export function markAuthDegraded(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_DEGRADED_KEY, "1");
}

export function markAuthMeFailed(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_AUTH_ME_FAILED_KEY, "1");
}

export function isAuthVerificationSettled(): boolean {
  if (typeof window === "undefined") return false;
  return (
    sessionStorage.getItem(SESSION_VERIFIED_KEY) === "1" ||
    sessionStorage.getItem(SESSION_DEGRADED_KEY) === "1"
  );
}

export function clearAuthVerificationState(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_VERIFIED_KEY);
  sessionStorage.removeItem(SESSION_DEGRADED_KEY);
  sessionStorage.removeItem(SESSION_AUTH_ME_FAILED_KEY);
}
