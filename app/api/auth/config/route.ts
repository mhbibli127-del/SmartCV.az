import { NextResponse } from "next/server";
import { getGoogleOAuthConfig } from "@/lib/google-oauth";
import { getNextAuthUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { enabled, callbackUrl } = getGoogleOAuthConfig();
    return NextResponse.json({
      google: enabled,
      callbackUrl,
      nextAuthUrl: getNextAuthUrl(),
    });
  } catch {
    return NextResponse.json({
      google: false,
      callbackUrl: null,
      nextAuthUrl: process.env.NEXTAUTH_URL ?? null,
    });
  }
}
