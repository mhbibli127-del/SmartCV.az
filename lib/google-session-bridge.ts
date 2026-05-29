import type { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { findUserByEmail } from "@/lib/users";
import { signSessionToken } from "@/lib/token";
import { setAuthStateCookie, sessionCookieOptions } from "@/lib/auth-cookie";
import { upsertSaasUserOnAuth } from "@/lib/saas-user";

export const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

export type GoogleBridgeUser = {
  email: string;
  name?: string | null;
  image?: string | null;
};

export type GoogleAccountLink = {
  providerAccountId: string;
  access_token?: string | null;
  refresh_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
};

/** Persist Prisma user + Mongo SaaS record for Google sign-in. Idempotent. */
export async function ensureGoogleUser(
  user: GoogleBridgeUser,
  account?: GoogleAccountLink | null
) {
  const email = user.email.toLowerCase().trim();

  let prismaUser = await findUserByEmail(email);

  if (!prismaUser) {
    prismaUser = await prisma.user.create({
      data: {
        email,
        name: user.name ?? email.split("@")[0],
        image: user.image ?? null,
        emailVerified: new Date(),
        provider: "google",
      },
    });
  } else if ("id" in prismaUser) {
    prismaUser = await prisma.user.update({
      where: { id: prismaUser.id },
      data: {
        ...(user.name ? { name: user.name } : {}),
        ...(user.image ? { image: user.image } : {}),
        emailVerified: prismaUser.emailVerified ?? new Date(),
        provider: "google",
      },
    });
  }

  if (account?.providerAccountId && "id" in prismaUser) {
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId: account.providerAccountId,
        },
      },
      create: {
        userId: prismaUser.id,
        type: "oauth",
        provider: "google",
        providerAccountId: account.providerAccountId,
        access_token: account.access_token ?? null,
        refresh_token: account.refresh_token ?? null,
        expires_at: account.expires_at ?? null,
        token_type: account.token_type ?? null,
        scope: account.scope ?? null,
        id_token: account.id_token ?? null,
      },
      update: {
        access_token: account.access_token ?? undefined,
        refresh_token: account.refresh_token ?? undefined,
        expires_at: account.expires_at ?? undefined,
        token_type: account.token_type ?? undefined,
        scope: account.scope ?? undefined,
        id_token: account.id_token ?? undefined,
      },
    });
  }

  await upsertSaasUserOnAuth({ email, name: user.name });

  return prismaUser;
}

/** Issue JWT + auth_state cookies so all legacy API routes work after Google OAuth. */
export function attachSessionCookies(
  response: NextResponse,
  email: string,
  secure: boolean
): NextResponse {
  const normalized = email.toLowerCase().trim();
  const token = signSessionToken({ email: normalized, verified: true });

  response.cookies.set("token", token, sessionCookieOptions(secure, SESSION_MAX_AGE));
  setAuthStateCookie(response, SESSION_MAX_AGE, secure);

  return response;
}

/** Sanitize post-login redirect — blocks open redirects. */
export function sanitizeAuthRedirect(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }
  if (next.startsWith("/login") || next.startsWith("/register")) {
    return "/dashboard";
  }
  return next;
}
