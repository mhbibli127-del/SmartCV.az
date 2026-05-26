import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import {
  attachSessionCookies,
  ensureGoogleUser,
  sanitizeAuthRedirect,
} from "@/lib/google-session-bridge";

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

    await ensureGoogleUser({
      email: auth.email,
      name: auth.name,
      image: auth.image,
    });

    const next = sanitizeAuthRedirect(req.nextUrl.searchParams.get("next"));
    const response = NextResponse.redirect(new URL(next, req.url));
    attachSessionCookies(response, auth.email);

    return response;
  } catch (err) {
    console.error("[auth/sync-session]", err);
    return NextResponse.redirect(
      new URL("/login?error=OAuthCallback", req.url)
    );
  }
}
