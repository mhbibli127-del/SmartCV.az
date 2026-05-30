import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { getAuthOptions } from "@/lib/auth-options";
import { verifyAccessToken } from "@/lib/auth";
import { getNextAuthSecret } from "@/lib/env";
import { verifySessionToken } from "@/lib/token";

export type AuthenticatedUser = {
  email: string;
  userId?: string;
  name?: string | null;
  image?: string | null;
};

async function userFromNextAuthJwt(
  req: NextRequest
): Promise<AuthenticatedUser | null> {
  const jwt = await getToken({ req, secret: getNextAuthSecret() });
  if (!jwt?.email) return null;
  return {
    email: String(jwt.email).toLowerCase().trim(),
    userId: jwt.sub,
    name: (jwt.name as string | null | undefined) ?? null,
    image: (jwt.picture as string | null | undefined) ?? null,
  };
}

export async function getAuthenticatedUser(
  req?: NextRequest
): Promise<AuthenticatedUser | null> {
  // Route handlers: read NextAuth JWT from the incoming request (getServerSession is unreliable here).
  if (req) {
    const fromOAuth = await userFromNextAuthJwt(req);
    if (fromOAuth) return fromOAuth;
  }

  const session = await getServerSession(getAuthOptions());
  if (session?.user?.email) {
    return {
      email: session.user.email,
      userId: (session.user as { id?: string }).id,
      name: session.user.name,
      image: session.user.image,
    };
  }

  const token =
    req?.cookies.get("token")?.value ?? cookies().get("token")?.value;

  if (!token) return null;

  const access = verifyAccessToken(token);
  if (access?.email) {
    return { email: access.email, userId: access.userId };
  }

  const legacy = verifySessionToken(token);
  if (legacy?.email && legacy.verified) {
    return { email: legacy.email };
  }

  return null;
}
