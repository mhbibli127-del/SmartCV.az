import { getPostHogHost, getPostHogKey } from "@/lib/utils/analytics/env";
import { sanitizeAnalyticsProperties } from "@/lib/utils/analytics/sanitize";
import type { AnalyticsEventName } from "@/lib/analytics/types";

/**
 * Server-side PostHog capture via HTTP ingest (no posthog-node dependency).
 * Fire-and-forget — never blocks API routes.
 */
export function captureServerEvent(
  distinctId: string,
  event: AnalyticsEventName | string,
  properties: Record<string, unknown> = {}
): void {
  const key = getPostHogKey();
  if (!key) return;

  const host = getPostHogHost().replace(/\/$/, "");
  const payload = {
    api_key: key,
    event,
    distinct_id: distinctId,
    properties: {
      ...sanitizeAnalyticsProperties(properties),
      $lib: "smartcv-server",
      environment: process.env.NODE_ENV ?? "development",
    },
    timestamp: new Date().toISOString(),
  };

  void fetch(`${host}/capture/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {
    /* analytics must never break product flows */
  });
}

export function captureAIUsageServer(
  email: string,
  props: {
    feature: string;
    action: string;
    success: boolean;
    model?: string;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    estimatedCostUsd?: number;
    durationMs?: number;
    errorCode?: string;
  }
): void {
  const event = props.success ? "ai_generation_success" : "ai_generation_failure";
  captureServerEvent(email, event, {
    ...props,
    page: props.action,
    source: "server",
  });
  captureServerEvent(email, "ai_usage", { ...props, source: "server" });
}
