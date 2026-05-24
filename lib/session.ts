import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth-options";
import { verifyAccessToken } from "@/lib/auth";
import { verifySessionToken } from "@/lib/token";

export type AuthenticatedUser = {
  email: string;
  userId?: string;
  name?: string | null;
  image?: string | null;
};

export async function getAuthenticatedUser(
  req?: NextRequest
): Promise<AuthenticatedUser | null> {
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
