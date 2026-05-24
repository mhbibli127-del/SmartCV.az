import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import { findUserByEmail, isUserVerified } from "@/lib/users";
import { signSessionToken } from "@/lib/token";
import { setAuthStateCookie } from "@/lib/auth-cookie";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

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
 * Bridge a valid NextAuth (Google) session into our JWT + auth_state cookies
 * so all existing API routes work without rewriting every handler.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = auth.email.toLowerCase().trim();
    let user = await findUserByEmail(email);

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: auth.name ?? email.split("@")[0],
          image: auth.image ?? null,
          emailVerified: new Date(),
          provider: "google",
        },
      });
    } else if ("id" in user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(auth.name ? { name: auth.name } : {}),
          ...(auth.image ? { image: auth.image } : {}),
          emailVerified: user.emailVerified ?? new Date(),
          provider: "google",
        },
      });
    }

    const token = signSessionToken({ email, verified: true });
    const response = NextResponse.json({
      success: true,
      email,
      name: user.name ?? auth.name,
      image: ("image" in user ? user.image : null) ?? auth.image ?? null,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_MAX_AGE,
    });
    setAuthStateCookie(response, SESSION_MAX_AGE);

    return response;
  } catch (error: unknown) {
    console.error("[auth/me POST bridge]", error);
    return NextResponse.json({ error: "Failed to sync session" }, { status: 500 });
  }
}
