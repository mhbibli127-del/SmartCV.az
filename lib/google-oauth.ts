import { getAppUrl } from "@/lib/env";

/** True when Google OAuth credentials are present and not placeholders. */
export function isGoogleOAuthConfigured(): boolean {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return false;
  if (clientId.length < 10 || clientSecret.length < 10) return false;
  return true;
}

/** NextAuth callback URL — register this in Google Cloud Console. */
export function getGoogleCallbackUrl(): string {
  const base = process.env.NEXTAUTH_URL?.trim() || getAppUrl();
  return `${base.replace(/\/$/, "")}/api/auth/callback/google`;
}

export function getGoogleOAuthConfig() {
  return {
    enabled: isGoogleOAuthConfigured(),
    callbackUrl: getGoogleCallbackUrl(),
  };
}
