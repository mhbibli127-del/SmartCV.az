import { NextResponse } from "next/server";
import { getGoogleOAuthConfig } from "@/lib/google-oauth";

export const dynamic = "force-dynamic";

export async function GET() {
  const { enabled, callbackUrl } = getGoogleOAuthConfig();
  return NextResponse.json({
    google: enabled,
    callbackUrl,
  });
}
