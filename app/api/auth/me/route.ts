import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import { findUserByEmail, isUserVerified } from "@/lib/users";
import {
  attachSessionCookies,
  ensureGoogleUser,
} from "@/lib/google-session-bridge";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await findUserByEmail(auth.email);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isUserVerified(user)) {
      return NextResponse.json(
        {
          error: "Email not verified",
          redirect: `/verify-otp?email=${encodeURIComponent(auth.email)}`,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      email: user.email ?? auth.email,
      name: user.name ?? auth.name ?? null,
      image: ("image" in user ? user.image : null) ?? auth.image ?? null,
    });
  } catch (error: unknown) {
    console.error("[auth/me]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Bridge a valid NextAuth (Google) session into JWT + auth_state cookies.
 * Primary OAuth flow uses GET /api/auth/sync-session; this POST remains
 * for client recovery when cookies are missing but NextAuth session exists.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = auth.email.toLowerCase().trim();
    const user = await ensureGoogleUser({
      email,
      name: auth.name,
      image: auth.image,
    });

    const response = NextResponse.json({
      success: true,
      email,
      name: user.name ?? auth.name,
      image: ("image" in user ? user.image : null) ?? auth.image ?? null,
    });

    attachSessionCookies(response, email);

    return response;
  } catch (error: unknown) {
    console.error("[auth/me POST bridge]", error);
    return NextResponse.json({ error: "Failed to sync session" }, { status: 500 });
  }
}
