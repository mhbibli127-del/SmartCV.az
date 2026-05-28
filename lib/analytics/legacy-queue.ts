/**
 * Debounces legacy Mongo analytics POSTs to reduce load on navigation-heavy sessions.
 */

const LEGACY_FLUSH_MS = 2_500;
const PAGE_VIEW_DEDUPE_MS = 30_000;

type LegacyItem = { eventType: string; data: Record<string, unknown> };

let flushTimer: ReturnType<typeof setTimeout> | null = null;
const queue: LegacyItem[] = [];
let lastPageView: { page: string; at: number } | null = null;

function collapsePageViews(batch: LegacyItem[]): LegacyItem[] {
  const out: LegacyItem[] = [];
  let lastPvIndex = -1;

  for (const item of batch) {
    if (item.eventType === "page_view") {
      if (lastPvIndex >= 0) out.splice(lastPvIndex, 1);
      out.push(item);
      lastPvIndex = out.length - 1;
    } else {
      out.push(item);
    }
  }

  return out;
}

function shouldSkipPageView(data: Record<string, unknown>): boolean {
  const page = String(data.page ?? data.pathname ?? "");
  if (!page) return false;
  const now = Date.now();
  if (lastPageView?.page === page && now - lastPageView.at < PAGE_VIEW_DEDUPE_MS) {
    return true;
  }
  lastPageView = { page, at: now };
  return false;
}

export function enqueueLegacyAnalyticsEvent(
  eventType: string,
  data: Record<string, unknown>,
  send: (eventType: string, data: Record<string, unknown>) => Promise<void>
): void {
  if (typeof window === "undefined") return;

  if (eventType === "page_view" && shouldSkipPageView(data)) {
    return;
  }

  queue.push({ eventType, data });

  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    const batch = queue.splice(0);
    const collapsed = collapsePageViews(batch);
    void (async () => {
      for (const item of collapsed) {
        try {
          await send(item.eventType, item.data);
        } catch {
          /* non-blocking */
        }
      }
    })();
  }, LEGACY_FLUSH_MS);
}
