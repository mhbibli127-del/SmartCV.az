import { clearAuthStateClient } from "@/lib/auth-client";

const AUTH_STORAGE_KEYS = [
  "user_email",
  "auth_email",
  "pending_otp_email",
] as const;

export function clearAuthStorage() {
  if (typeof window === "undefined") return;
  for (const key of AUTH_STORAGE_KEYS) {
    localStorage.removeItem(key);
  }
  // Defensive: ensure the client-side auth-state cookie is gone even if
  // the server logout request fails (offline, network blip, etc.).
  clearAuthStateClient();
}

/** Clears JWT via API; call signOut() separately for Google/NextAuth sessions. */
export async function clearServerAuthSession(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}
