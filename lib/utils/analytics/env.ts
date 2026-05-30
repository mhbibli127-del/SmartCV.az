/** Client-safe analytics preferences (opt-out only). */

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
