import { NextResponse } from "next/server";
import { getGoogleOAuthConfig } from "@/lib/google-oauth";
import { getNextAuthUrl } from "@/lib/env";
import { getAuthOptions } from "@/lib/auth-options";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { enabled, callbackUrl } = getGoogleOAuthConfig();
    const providers = getAuthOptions().providers ?? [];
    return NextResponse.json({
      google: enabled && providers.length > 0,
      callbackUrl,
      nextAuthUrl: getNextAuthUrl(),
      providerCount: providers.length,
    });
  } catch {
    return NextResponse.json({
      google: false,
      callbackUrl: null,
      nextAuthUrl: process.env.NEXTAUTH_URL ?? null,
    });
  }
}
