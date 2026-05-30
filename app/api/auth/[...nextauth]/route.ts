import NextAuth from "next-auth";
import { getAuthOptions } from "@/lib/auth-options";
import { ensureAuthUrlForDeployment } from "@/lib/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Patch NEXTAUTH_URL before handler init (Vercel must not keep localhost from imported env). */
ensureAuthUrlForDeployment();

/** Single handler instance — required for stable CSRF cookies across /csrf and /signin. */
const handler = NextAuth(getAuthOptions());

export const GET = handler;
export const POST = handler;
