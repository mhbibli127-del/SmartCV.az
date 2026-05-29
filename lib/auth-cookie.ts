/**
 * Companion "auth_state" cookie for client-side gating.
 *
 * Our real session token is httpOnly (good — JS can't read it). But the
 * browser also can't see it, so client providers fire requests even when
 * the user is signed out and log noisy 401s in the console.
 *
 * This is a *non-httpOnly* mirror cookie with no secrets — just the value
 * "1" when a session was issued. JS reads it to decide whether to fetch
 * authenticated endpoints. It's set/cleared in lockstep with `token`.
 */
import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";

export const AUTH_STATE_COOKIE = "auth_state";

/** Match cookie Secure flag to the active request (fixes local http dev). */
export function cookieSecureFromRequest(req: NextRequest | URL): boolean {
  const url = req instanceof URL ? req : req.nextUrl;
  return url.protocol === "https:";
}

export function setAuthStateCookie(
  response: NextResponse,
  maxAgeSeconds: number,
  secure: boolean
): NextResponse {
  response.cookies.set(AUTH_STATE_COOKIE, "1", {
    httpOnly: false,
    path: "/",
    sameSite: "lax",
    secure,
    maxAge: maxAgeSeconds,
  });
  return response;
}

export function clearAuthStateCookie(
  response: NextResponse,
  secure: boolean
): NextResponse {
  response.cookies.set(AUTH_STATE_COOKIE, "", {
    httpOnly: false,
    path: "/",
    sameSite: "lax",
    secure,
    maxAge: 0,
  });
  return response;
}

/** Standard session cookie options shared by auth routes. */
export function sessionCookieOptions(secure: boolean, maxAge: number) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure,
    maxAge,
  };
}

export function clearSessionCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}
