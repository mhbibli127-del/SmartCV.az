import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { isGoogleOAuthConfigured } from "@/lib/google-oauth";
import {
  createNotification,
  notificationMessages,
} from "@/lib/notifications";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as Parameters<typeof PrismaAdapter>[0]),
  providers: isGoogleOAuthConfigured()
    ? [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID!.trim(),
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!.trim(),
          allowDangerousEmailAccountLinking: true,
        }),
      ]
    : [],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "database",
    maxAge: 7 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  events: {
    async signIn({ user, account }) {
      if (user.email && account?.provider === "google") {
        await createNotification({
          userId: user.email,
          type: "login",
          title: notificationMessages.login.title,
          message: notificationMessages.login.message,
        }).catch(() => {
          /* non-blocking */
        });
      }
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user.email) return true;

      const email = user.email.toLowerCase().trim();
      try {
        await prisma.user.upsert({
          where: { email },
          create: {
            email,
            name: user.name ?? email.split("@")[0],
            image: user.image ?? null,
            emailVerified: new Date(),
            provider: "google",
          },
          update: {
            name: user.name ?? undefined,
            image: user.image ?? undefined,
            emailVerified: new Date(),
            provider: "google",
          },
        });
      } catch (err) {
        console.error("[nextauth] Google user upsert failed", err);
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return `${baseUrl}/dashboard`;
    },
    async session({ session, user }) {
      if (session.user && user) {
        (session.user as { id?: string }).id = String(user.id);
        session.user.name = user.name ?? session.user.name;
        session.user.email = user.email ?? session.user.email;
        session.user.image = user.image ?? session.user.image;
      }
      return session;
    },
  },
  secret:
    process.env.NEXTAUTH_SECRET?.trim() ||
    process.env.JWT_SECRET?.trim() ||
    "dev-only-change-me-in-production",
  debug: process.env.NODE_ENV === "development",
};
