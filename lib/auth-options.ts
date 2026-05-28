import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { isBuildPhase } from "@/lib/build";
import { getNextAuthSecret, getNextAuthUrl } from "@/lib/env";
import { ensureGoogleUser } from "@/lib/google-session-bridge";
import { isGoogleOAuthConfigured, getGoogleClientId, getGoogleClientSecret } from "@/lib/google-oauth";

let cachedOptions: NextAuthOptions | null = null;

function buildProviders() {
  if (!isGoogleOAuthConfigured()) return [];

  return [
    GoogleProvider({
      clientId: getGoogleClientId(),
      clientSecret: getGoogleClientSecret(),
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "online",
          response_type: "code",
        },
      },
    }),
  ];
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
 * - Google users are persisted via ensureGoogleUser() in signIn callback
 * - JWT app cookies are issued via /api/auth/sync-session after OAuth redirect
 */
export function getAuthOptions(): NextAuthOptions {
  if (cachedOptions) return cachedOptions;

  cachedOptions = {
    providers: buildProviders(),
    pages: {
      signIn: "/login",
      error: "/login",
    },
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
          await ensureGoogleUser(
            {
              email: user.email,
              name: user.name,
              image: user.image,
            },
            account.providerAccountId
              ? {
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                }
              : null
          );
        } catch (err) {
          console.error("[nextauth] Google user upsert failed", err);
        }
        return true;
      },
      async redirect({ url, baseUrl }) {
        const resolvedBase = (
          process.env.NODE_ENV === "development"
            ? getNextAuthUrl()
            : baseUrl || getNextAuthUrl()
        ).replace(/\/$/, "");

        // Preserve OAuth error redirects to login
        if (url.includes("error=")) {
          if (url.startsWith("/")) return `${resolvedBase}${url}`;
          return url;
        }

        // Skip re-sync if already routed through bridge
        if (url.includes("/api/auth/sync-session")) {
          return url;
        }

        let nextPath = "/dashboard";
        if (url.startsWith(resolvedBase)) {
          nextPath = url.slice(resolvedBase.length) || "/dashboard";
        } else if (url.startsWith("/")) {
          nextPath = url;
        }

        const sync = new URL("/api/auth/sync-session", resolvedBase);
        sync.searchParams.set("next", nextPath);
        return sync.toString();
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
          session.user.id = token.sub;
        }
        return session;
      },
    },
    secret: getNextAuthSecret(),
    debug: process.env.NODE_ENV === "development",
  };

  return cachedOptions;
}
