import type { NextRequest, NextResponse } from "next/server";
import {
  AUTH_STATE_COOKIE,
  clearAuthStateCookie,
  clearSessionCookieOptions,
  cookieSecureFromRequest,
} from "@/lib/auth-cookie";

const AUTH_COOKIE_NAMES = [
  "token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "next-auth.csrf-token",
  "__Host-next-auth.csrf-token",
  "next-auth.callback-url",
  "__Secure-next-auth.callback-url",
] as const;

type JwtPayload = {
  email?: string;
  verified?: boolean;
  exp?: number;
};

/** Edge-safe JWT payload read (routing hint only — APIs still verify signatures). */
function readJwtPayload(token: string): JwtPayload | null {
  try {
    const segment = token.split(".")[1];
    if (!segment) return null;
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

function isTokenUsable(token: string): boolean {
  const payload = readJwtPayload(token);
  if (!payload?.email) return false;
  if (payload.exp && payload.exp * 1000 < Date.now()) return false;
  if (payload.verified === false) return false;
  return true;
}

export function hasOAuthSessionCookie(request: NextRequest): boolean {
  return Boolean(
    request.cookies.get("next-auth.session-token")?.value ||
      request.cookies.get("__Secure-next-auth.session-token")?.value
  );
}

/** Email session: auth_state mirror + non-expired JWT with verified email. */
export function hasValidEmailSession(request: NextRequest): boolean {
  const authState = request.cookies.get(AUTH_STATE_COOKIE)?.value;
  const token = request.cookies.get("token")?.value;
  if (authState !== "1" || !token) return false;
  return isTokenUsable(token);
}

export function isMiddlewareAuthenticated(request: NextRequest): boolean {
  return hasValidEmailSession(request) || hasOAuthSessionCookie(request);
}

/** User is explicitly signing in again — do not bounce back to /dashboard. */
export function shouldBypassAuthenticatedRedirect(request: NextRequest): boolean {
  const params = request.nextUrl.searchParams;
  if (params.get("reason") === "session_expired") return true;
  if (params.get("logout") === "1") return true;
  if (params.has("error")) return true;
  return false;
}

export function clearAuthCookiesOnResponse(
  response: NextResponse,
  request: NextRequest
): NextResponse {
  const secure = cookieSecureFromRequest(request);
  const opts = clearSessionCookieOptions(secure);
  for (const name of AUTH_COOKIE_NAMES) {
    response.cookies.set(name, "", opts);
  }
  clearAuthStateCookie(response, secure);
  return response;
}
