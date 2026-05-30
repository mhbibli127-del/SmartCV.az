import { NextResponse } from "next/server";
import { getGoogleOAuthConfig } from "@/lib/google-oauth";
import { ensureAuthUrlForDeployment, getNextAuthUrl } from "@/lib/env";
import { getAuthOptions } from "@/lib/auth-options";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    ensureAuthUrlForDeployment();
    const { enabled, callbackUrl } = getGoogleOAuthConfig();
    const providers = getAuthOptions().providers ?? [];
    return NextResponse.json({
      google: enabled && providers.length > 0,
      callbackUrl,
      nextAuthUrl: getNextAuthUrl(),
      /** Register this exact URI in Google Cloud Console → OAuth redirect URIs */
      googleRedirectUri: callbackUrl,
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
