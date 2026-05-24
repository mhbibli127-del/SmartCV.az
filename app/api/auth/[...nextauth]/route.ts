import NextAuth from "next-auth";
import { getAuthOptions } from "@/lib/auth-options";

/**
 * App Router NextAuth handler.
 * Options are resolved lazily so the static build never touches Prisma/DB.
 */
const handler = NextAuth(getAuthOptions());

export { handler as GET, handler as POST };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
