import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import {
  attachSessionCookies,
  ensureGoogleUser,
  sanitizeAuthRedirect,
} from "@/lib/google-session-bridge";
import { cookieSecureFromRequest } from "@/lib/auth-cookie";

export const dynamic = "force-dynamic";

/**
 * Server-side bridge after Google OAuth.
 * NextAuth session → JWT cookies → redirect to app.
 * Eliminates client-side race where dashboard APIs fire before cookies exist.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth?.email) {
      return NextResponse.redirect(
        new URL("/login?error=OAuthCallback", req.url)
      );
    }

    try {
      await ensureGoogleUser({
        email: auth.email,
        name: auth.name,
        image: auth.image,
      });
    } catch (dbErr) {
      // DB outage must not block login — JWT cookies are enough for the app session.
      console.error("[auth/sync-session] user persist failed (continuing)", dbErr);
    }

    const next = sanitizeAuthRedirect(req.nextUrl.searchParams.get("next"));
    const response = NextResponse.redirect(new URL(next, req.url));
    attachSessionCookies(response, auth.email, cookieSecureFromRequest(req));

    return response;
  } catch (err) {
    console.error("[auth/sync-session]", err);
    return NextResponse.redirect(
      new URL("/login?error=OAuthCallback", req.url)
    );
  }
}
