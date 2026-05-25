import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const authRoutes = [
  "/login",
  "/register",
  "/verify-otp",
];

const protectedRoutes = [
  "/dashboard",
  "/admin",
];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("token")?.value;
  const authState = request.cookies.get("auth_state")?.value;
  const nextAuthSession =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  // Email/password sessions require BOTH httpOnly token + client auth_state mirror.
  const hasEmailAuth = Boolean(token && authState === "1");
  const hasOAuth = Boolean(nextAuthSession);
  const isAuthenticated = hasEmailAuth || hasOAuth;

  const isAuthRoute = authRoutes.includes(pathname);
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Stale auth_state without token → treat as signed out.
  if (authState === "1" && !token && !nextAuthSession && isProtectedRoute) {
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.set("auth_state", "", { path: "/", maxAge: 0 });
    return res;
  }

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && isAuthenticated) {
    // Allow unverified email sessions to stay on /verify-otp.
    if (pathname === "/verify-otp") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname === "/") {
    return isAuthenticated
      ? NextResponse.redirect(new URL("/dashboard", request.url))
      : NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/verify-otp",
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};
