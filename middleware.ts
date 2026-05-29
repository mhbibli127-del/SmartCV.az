import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

  const token = request.cookies.get("token")?.value;
  const authState = request.cookies.get("auth_state")?.value;
  const nextAuthSession =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  const hasEmailAuth = Boolean(token && authState === "1");
  const hasOAuth = Boolean(nextAuthSession);
  const isAuthenticated = hasEmailAuth || hasOAuth;

  const isProtectedRoute = isProtectedPath(pathname);
  const onAuthRoute = isAuthPath(pathname);

  if (authState === "1" && !token && !nextAuthSession && isProtectedRoute) {
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.set("auth_state", "", { path: "/", maxAge: 0 });
    return res;
  }

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (onAuthRoute && isAuthenticated) {
    if (AUTH_COMPLETION_PATHS.includes(pathname)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Logged-in users land on dashboard; guests see the public homepage at app/page.tsx.
  if (pathname === "/") {
    return isAuthenticated
      ? NextResponse.redirect(new URL("/dashboard", request.url))
      : NextResponse.next();
  }

  return NextResponse.next();
}

// Sentry tunnel is `/monitoring` (see next.config.mjs) — intentionally excluded from matcher.
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
