import { getNextAuthUrl } from "@/lib/env";

/** Google OAuth client id from env (server-side). */
export function getGoogleClientId(): string {
  return process.env.GOOGLE_CLIENT_ID?.trim() ?? "";
}

/** Google OAuth client secret from env (server-side). */
export function getGoogleClientSecret(): string {
  return process.env.GOOGLE_CLIENT_SECRET?.trim() ?? "";
}

/** True when Google OAuth credentials are present and not placeholders. */
export function isGoogleOAuthConfigured(): boolean {
  const clientId = getGoogleClientId();
  const clientSecret = getGoogleClientSecret();
  if (!clientId || !clientSecret) return false;
  if (clientId.length < 10 || clientSecret.length < 10) return false;
  return true;
}

/** NextAuth callback URL — register this in Google Cloud Console. */
export function getGoogleCallbackUrl(): string {
  const base = getNextAuthUrl();
  return `${base.replace(/\/$/, "")}/api/auth/callback/google`;
}

export function getGoogleOAuthConfig() {
  return {
    enabled: isGoogleOAuthConfigured(),
    callbackUrl: getGoogleCallbackUrl(),
  };
}
