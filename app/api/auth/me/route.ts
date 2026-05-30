import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import { findUserByEmail, isUserVerified } from "@/lib/users";
import {
  attachSessionCookies,
  ensureGoogleUser,
} from "@/lib/google-session-bridge";
import { cookieSecureFromRequest } from "@/lib/auth-cookie";
import { assertDatabaseAvailable } from "@/lib/db-circuit";
import { handleApiError } from "@/lib/api-errors";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      assertDatabaseAvailable();
    } catch {
      /* Prisma may be misconfigured — findUserByEmail falls back to local JSON */
    }

    let user = await findUserByEmail(auth.email);
    if (!user) {
      try {
        await ensureGoogleUser({
          email: auth.email,
          name: auth.name,
          image: auth.image,
        });
        user = await findUserByEmail(auth.email);
      } catch (dbErr) {
        console.error("[auth/me] user lookup/create failed", dbErr);
      }
    }

    if (!user) {
      // DB may be down — still allow OAuth session so login does not loop.
      return NextResponse.json({
        email: auth.email,
        name: auth.name ?? null,
        image: auth.image ?? null,
        degraded: true,
      });
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
    return handleApiError(error, "auth/me GET", "Failed to load profile");
  }
}

/**
 * Bridge a valid NextAuth (Google) session into JWT + auth_state cookies.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      assertDatabaseAvailable();
    } catch {
      /* allow bridge with local user record when Postgres is down */
    }

    const email = auth.email.toLowerCase().trim();
    let name = auth.name ?? null;
    let image = auth.image ?? null;

    try {
      const user = await ensureGoogleUser({
        email,
        name: auth.name,
        image: auth.image,
      });
      name = user.name ?? name;
      image = ("image" in user ? user.image : null) ?? image;
    } catch (dbErr) {
      console.error("[auth/me] bridge persist failed (continuing)", dbErr);
    }

    const response = NextResponse.json({
      success: true,
      email,
      name,
      image,
    });

    attachSessionCookies(response, email, cookieSecureFromRequest(req));

    return response;
  } catch (error: unknown) {
    return handleApiError(error, "auth/me POST bridge", "Failed to sync session");
  }
}
