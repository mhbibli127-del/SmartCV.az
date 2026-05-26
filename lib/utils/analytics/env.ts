/** Client-safe PostHog configuration checks (no secrets). */

export function getPostHogKey(): string | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
  if (!key || key.length < 8) return null;
  return key;
}

export function getPostHogHost(): string {
  return (
    process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com"
  );
}

export function isPostHogConfigured(): boolean {
  return Boolean(getPostHogKey());
}

export function isAnalyticsOptedOut(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem("smartcv_analytics_opt_out") === "1";
  } catch {
    return false;
  }
}

export function setAnalyticsOptOut(optOut: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (optOut) {
      localStorage.setItem("smartcv_analytics_opt_out", "1");
    } else {
      localStorage.removeItem("smartcv_analytics_opt_out");
    }
  } catch {
    /* ignore */
  }
}
