import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { isBuildPhase } from "@/lib/build";
import { getNextAuthSecret, getNextAuthUrl } from "@/lib/env";
import { isGoogleOAuthConfigured } from "@/lib/google-oauth";

let cachedOptions: NextAuthOptions | null = null;

function buildProviders() {
  if (!isGoogleOAuthConfigured()) return [];

  return [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!.trim(),
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!.trim(),
      allowDangerousEmailAccountLinking: true,
    }),
  ];
}

/** Lazy Prisma + MongoDB SaaS user upsert on Google login. */
async function upsertGoogleUser(params: {
  email: string;
  name?: string | null;
  image?: string | null;
}) {
  if (isBuildPhase()) return;

  const { default: prisma } = await import("@/lib/prisma");
  const { upsertSaasUserOnAuth } = await import("@/lib/saas-user");
  const email = params.email.toLowerCase().trim();

  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: params.name ?? email.split("@")[0],
      image: params.image ?? null,
      emailVerified: new Date(),
      provider: "google",
      plan: "free",
      cvLimit: 3,
      cvUsed: 0,
    },
    update: {
      name: params.name ?? undefined,
      image: params.image ?? undefined,
      emailVerified: new Date(),
      provider: "google",
    },
  });

  await upsertSaasUserOnAuth({ email, name: params.name });
}

async function notifyGoogleLogin(email: string) {
  if (isBuildPhase()) return;

  try {
    const { createNotification, notificationMessages } = await import(
      "@/lib/notifications"
    );
    await createNotification({
      userId: email,
      type: "login",
      title: notificationMessages.login.title,
      message: notificationMessages.login.message,
    });
  } catch {
    /* non-blocking */
  }
}

/**
 * NextAuth configuration.
 *
 * Uses JWT sessions (not PrismaAdapter) so:
 * - Vercel builds never open a DB connection during page-data collection
 * - Serverless deploys work without SQLite file persistence
 * - Google users are still persisted via upsertGoogleUser() in signIn callback
 */
export function getAuthOptions(): NextAuthOptions {
  if (cachedOptions) return cachedOptions;

  cachedOptions = {
    providers: buildProviders(),
    pages: {
      signIn: "/login",
      error: "/login",
    },
    // JWT strategy — no PrismaAdapter (build-safe + Vercel-compatible)
    session: {
      strategy: "jwt",
      maxAge: 7 * 24 * 60 * 60,
      updateAge: 24 * 60 * 60,
    },
    events: {
      async signIn({ user, account }) {
        if (user.email && account?.provider === "google") {
          await notifyGoogleLogin(user.email);
        }
      },
    },
    callbacks: {
      async signIn({ user, account }) {
        if (account?.provider !== "google" || !user.email) return true;

        try {
          await upsertGoogleUser({
            email: user.email,
            name: user.name,
            image: user.image,
          });
        } catch (err) {
          console.error("[nextauth] Google user upsert failed", err);
        }
        return true;
      },
      async redirect({ url, baseUrl }) {
        const resolvedBase = baseUrl || getNextAuthUrl();
        if (url.startsWith(resolvedBase)) return url;
        if (url.startsWith("/")) return `${resolvedBase}${url}`;
        return `${resolvedBase}/dashboard`;
      },
      async jwt({ token, user, account }) {
        if (user?.email) {
          token.email = user.email.toLowerCase();
          token.name = user.name;
          token.picture = user.image;
        }
        if (account?.provider === "google") {
          token.provider = "google";
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          if (token.email) session.user.email = String(token.email);
          if (token.name) session.user.name = String(token.name);
          if (token.picture) session.user.image = String(token.picture);
          (session.user as { id?: string }).id = token.sub;
        }
        return session;
      },
    },
    secret: getNextAuthSecret(),
    debug: process.env.NODE_ENV === "development",
  };

  return cachedOptions;
}
