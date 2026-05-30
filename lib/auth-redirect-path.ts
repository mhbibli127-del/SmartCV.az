/**
 * Final app path after OAuth (never a sync-session or login URL).
 * Prevents nested `/api/auth/sync-session?next=/api/auth/sync-session...` loops.
 */
export function resolveOAuthDestination(
  raw: string | null | undefined
): string {
  if (!raw?.trim()) return "/dashboard";

  let value = decodeURIComponent(raw.trim());
  let guard = 0;

  while (value.includes("sync-session") && guard < 12) {
    guard += 1;
    try {
      const path = value.startsWith("http")
        ? new URL(value).pathname + new URL(value).search
        : value;
      const q = path.indexOf("?");
      const inner =
        q >= 0 ? new URLSearchParams(path.slice(q + 1)).get("next") : null;
      if (!inner) return "/dashboard";
      value = decodeURIComponent(inner);
    } catch {
      return "/dashboard";
    }
  }

  if (value.includes("sync-session") || value.includes("/api/auth/")) {
    return "/dashboard";
  }

  return sanitizeAuthRedirect(value.split("?")[0]);
}

/** Sanitize post-login redirect — blocks open redirects. Edge + client safe. */
export function sanitizeAuthRedirect(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }
  if (next.startsWith("/login") || next.startsWith("/register")) {
    return "/dashboard";
  }
  return next;
}

/** OAuth callback target — issues JWT cookies before entering the app. */
export function buildOAuthSyncCallbackUrl(
  next: string | null | undefined = "/dashboard"
): string {
  const path = resolveOAuthDestination(next);
  return `/api/auth/sync-session?next=${encodeURIComponent(path)}`;
}
