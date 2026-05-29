import type { PostHogConfig } from "posthog-js";
import {
  getPostHogHost,
  getPostHogUiHost,
  markPostHogDisabled,
} from "@/lib/utils/analytics/env";

/** Shared PostHog init options — avoids duplicate config + noisy flag requests. */
export function getPostHogInitOptions(options?: {
  onLoaded?: () => void;
  onFailed?: () => void;
}): Partial<PostHogConfig> {
  return {
    api_host: getPostHogHost(),
    ui_host: getPostHogUiHost(),
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: false,
    disable_surveys: true,
    persistence: "localStorage+cookie",
    disable_session_recording: process.env.NODE_ENV === "development",
    respect_dnt: true,
    // We don't use PostHog feature flags — skip /flags and /decide calls (401 spam).
    advanced_disable_flags: true,
    advanced_disable_decide: true,
    loaded: () => {
      options?.onLoaded?.();
    },
    on_request_error: (error) => {
      const status = "status" in error ? Number(error.status) : 0;
      if (status === 401 || status === 404) {
        markPostHogDisabled();
        options?.onFailed?.();
      }
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.warn(
          "[posthog] Request failed — check NEXT_PUBLIC_POSTHOG_KEY and NEXT_PUBLIC_POSTHOG_HOST (US vs EU). Analytics disabled for this session."
        );
      }
    },
  };
}
