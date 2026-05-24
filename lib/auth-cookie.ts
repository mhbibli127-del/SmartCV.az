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
import type { NextResponse } from "next/server";

export const AUTH_STATE_COOKIE = "auth_state";

export function setAuthStateCookie(
  response: NextResponse,
  maxAgeSeconds: number
): NextResponse {
  response.cookies.set(AUTH_STATE_COOKIE, "1", {
    httpOnly: false,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: maxAgeSeconds,
  });
  return response;
}

export function clearAuthStateCookie(response: NextResponse): NextResponse {
  response.cookies.set(AUTH_STATE_COOKIE, "", {
    httpOnly: false,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });
  return response;
}
