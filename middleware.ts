import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  clearAuthCookiesOnResponse,
  hasOAuthSessionCookie,
  hasValidEmailSession,
  isMiddlewareAuthenticated,
  shouldBypassAuthenticatedRedirect,
} from "@/lib/auth-middleware";

const AUTH_COMPLETION_PATHS = ["/verify-otp", "/register/otp"];

function isAuthPath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/verify-otp" ||
    pathname.startsWith("/register/")
  );
}

function isProtectedPath(pathname: string): boolean {
  return pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasEmail = hasValidEmailSession(request);
  const hasOAuth = hasOAuthSessionCookie(request);
  const isAuthenticated = hasEmail || hasOAuth;

  const isProtectedRoute = isProtectedPath(pathname);
  const onAuthRoute = isAuthPath(pathname);
  const bypassAuthRedirect = shouldBypassAuthenticatedRedirect(request);

  // Stale auth_state without a usable token/session — clear and continue.
  const authState = request.cookies.get("auth_state")?.value;
  const rawToken = request.cookies.get("token")?.value;
  if (authState === "1" && rawToken && !hasEmail && !hasOAuth) {
    if (isProtectedRoute) {
      const res = NextResponse.redirect(new URL("/login?reason=session_expired", request.url));
      return clearAuthCookiesOnResponse(res, request);
    }
    if (onAuthRoute && bypassAuthRedirect) {
      const res = NextResponse.next();
      return clearAuthCookiesOnResponse(res, request);
    }
  }

  if (authState === "1" && !rawToken && !hasOAuth && isProtectedRoute) {
    const res = NextResponse.redirect(new URL("/login?reason=session_expired", request.url));
    return clearAuthCookiesOnResponse(res, request);
  }

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    if (!hasEmail && !hasOAuth && (rawToken || authState === "1")) {
      loginUrl.searchParams.set("reason", "session_expired");
    }
    const res = NextResponse.redirect(loginUrl);
    if (rawToken || authState === "1" || hasOAuth) {
      return clearAuthCookiesOnResponse(res, request);
    }
    return res;
  }

  if (onAuthRoute && isAuthenticated && !bypassAuthRedirect) {
    if (AUTH_COMPLETION_PATHS.includes(pathname)) {
      return NextResponse.next();
    }
    const dashboardUrl = new URL("/dashboard", request.url);
    if (request.nextUrl.pathname !== dashboardUrl.pathname) {
      return NextResponse.redirect(dashboardUrl);
    }
  }

  if (pathname === "/") {
    if (isAuthenticated) {
      const dashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

// API routes are not matched — no middleware redirect loop on /api/*
export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/register/:path*",
    "/verify-otp",
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};
