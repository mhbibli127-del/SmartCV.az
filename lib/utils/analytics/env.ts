/** Client-safe PostHog configuration checks (no secrets). */

const PLACEHOLDER_PATTERNS = [
  "your_",
  "your-",
  "xxx",
  "changeme",
  "phc_xxx",
  "test_key",
  "dummy",
];

/** Explicit kill-switch — set NEXT_PUBLIC_POSTHOG_ENABLED=false to disable. */
export function isPostHogExplicitlyDisabled(): boolean {
  const flag = process.env.NEXT_PUBLIC_POSTHOG_ENABLED?.trim().toLowerCase();
  return flag === "false" || flag === "0" || flag === "off";
}

/** PostHog only loads when explicitly enabled (avoids noisy requests with stale keys). */
export function isPostHogExplicitlyEnabled(): boolean {
  const flag = process.env.NEXT_PUBLIC_POSTHOG_ENABLED?.trim().toLowerCase();
  return flag === "true" || flag === "1" || flag === "on";
}

export function isValidPostHogKeyFormat(key: string): boolean {
  // Project API keys from PostHog → Project Settings always start with phc_
  return /^phc_[a-zA-Z0-9_-]{20,}$/.test(key);
}

export function getPostHogKey(): string | null {
  if (isPostHogExplicitlyDisabled() || !isPostHogExplicitlyEnabled()) return null;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
  if (!key || !isValidPostHogKeyFormat(key)) return null;

  const lower = key.toLowerCase();
  if (PLACEHOLDER_PATTERNS.some((p) => lower.includes(p))) return null;

  return key;
}

/** Ingest API host (US or EU). */
export function getPostHogHost(): string {
  const raw = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return "https://us.i.posthog.com";
}

/** UI host paired with ingest region — required for correct asset URLs. */
export function getPostHogUiHost(): string {
  const apiHost = getPostHogHost().toLowerCase();
  if (apiHost.includes("eu.i.posthog")) return "https://eu.posthog.com";
  if (apiHost.includes("eu.posthog.com")) return "https://eu.posthog.com";
  return "https://us.posthog.com";
}

export function isPostHogConfigured(): boolean {
  if (typeof window !== "undefined") {
    try {
      if (sessionStorage.getItem("smartcv_posthog_disabled") === "1") {
        return false;
      }
    } catch {
      /* ignore */
    }
  }
  return Boolean(getPostHogKey());
}

export function markPostHogDisabled(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem("smartcv_posthog_disabled", "1");
  } catch {
    /* ignore */
  }
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
