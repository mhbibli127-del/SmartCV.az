import { NextRequest, NextResponse } from "next/server";
import {
  clearAuthStateCookie,
  clearSessionCookieOptions,
  cookieSecureFromRequest,
} from "@/lib/auth-cookie";

const AUTH_COOKIES = [
  "token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "next-auth.csrf-token",
  "__Host-next-auth.csrf-token",
  "next-auth.callback-url",
  "__Secure-next-auth.callback-url",
] as const;

function clearAuthCookies(res: NextResponse, secure: boolean) {
  const opts = clearSessionCookieOptions(secure);
  for (const name of AUTH_COOKIES) {
    res.cookies.set(name, "", opts);
  }
  clearAuthStateCookie(res, secure);
  return res;
}

export async function GET(request: NextRequest) {
  const secure = cookieSecureFromRequest(request);
  const loginUrl = new URL("/login", request.url);
  const res = NextResponse.redirect(loginUrl);
  return clearAuthCookies(res, secure);
}

export async function POST(request: NextRequest) {
  const secure = cookieSecureFromRequest(request);
  return clearAuthCookies(NextResponse.json({ success: true }), secure);
}
