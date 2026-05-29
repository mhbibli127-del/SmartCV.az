"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics/posthog";

function PostHogPageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const skipInitialRef = useRef(true);

  useEffect(() => {
    if (!pathname) return;

    // capture_pageview: true handles the first load; track SPA navigations only.
    if (skipInitialRef.current) {
      skipInitialRef.current = false;
      return;
    }

    let url = window.origin + pathname;
    const query = searchParams?.toString();
    if (query) url += `?${query}`;

    trackEvent("$pageview", { $current_url: url, page: pathname });
  }, [pathname, searchParams]);

  return null;
}

/** App Router route-change tracking — wrapped in Suspense for SSR safety. */
export function PostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageViewTracker />
    </Suspense>
  );
}
