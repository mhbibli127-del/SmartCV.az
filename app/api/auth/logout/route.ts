import { NextRequest, NextResponse } from "next/server";
import { clearAuthStateCookie } from "@/lib/auth-cookie";

const AUTH_COOKIES = [
  "token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "next-auth.csrf-token",
  "__Host-next-auth.csrf-token",
  "next-auth.callback-url",
  "__Secure-next-auth.callback-url",
] as const;

function clearAuthCookies(res: NextResponse) {
  for (const name of AUTH_COOKIES) {
    res.cookies.set(name, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }
  clearAuthStateCookie(res);
  return res;
}

export async function GET(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  const res = NextResponse.redirect(loginUrl);
  return clearAuthCookies(res);
}

export async function POST() {
  return clearAuthCookies(NextResponse.json({ success: true }));
}
