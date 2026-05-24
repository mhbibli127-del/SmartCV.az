/**
 * Client-side helpers to detect whether we *likely* have a session.
 *
 * The real `token` cookie is httpOnly (security best practice). To avoid
 * firing 401 requests from public pages, we keep a sibling non-httpOnly
 * `auth_state` cookie that mirrors the session lifecycle. JS reads that
 * cookie before deciding whether to call authenticated endpoints.
 *
 * This is a UX hint, not a security boundary — the server is still the
 * authority on every protected request.
 */

const AUTH_STATE_COOKIE = "auth_state";
let recovering = false;

export function hasAuthStateCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some((c) => c.trim().startsWith(`${AUTH_STATE_COOKIE}=1`));
}

export function clearAuthStateClient(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_STATE_COOKIE}=; path=/; max-age=0`;
}

/** Clear stale client auth and redirect to login (once per page load). */
export async function recoverFromStaleSession(): Promise<void> {
  if (typeof window === "undefined" || recovering) return;
  recovering = true;
  clearAuthStateClient();
  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  } catch {
    /* ignore */
  }
  window.location.href = "/login?reason=session_expired";
}

/** True when we should attempt authenticated API calls from the client. */
export function shouldFetchAuthenticatedApis(
  sessionStatus?: "loading" | "authenticated" | "unauthenticated"
): boolean {
  if (sessionStatus === "authenticated") return true;
  if (sessionStatus === "loading") return false;
  return hasAuthStateCookie();
}
