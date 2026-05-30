import NextAuth from "next-auth";
import { getAuthOptions } from "@/lib/auth-options";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Single handler instance — required for stable CSRF cookies across /csrf and /signin. */
const handler = NextAuth(getAuthOptions());

export const GET = handler;
export const POST = handler;
