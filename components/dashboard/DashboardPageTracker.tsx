"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAnalytics } from "@/lib/analytics";

/** Single page-view per dashboard route change (deduped in analytics tracker). */
export function DashboardPageTracker() {
  const pathname = usePathname();
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    if (!pathname?.startsWith("/dashboard")) return;
    trackPageView(pathname);
  }, [pathname, trackPageView]);

  return null;
}
