import type { AnalyticsEventName } from "@/lib/analytics/types";

/** Server-side analytics stub — events are not forwarded externally. */
export function captureServerEvent(
  _distinctId: string,
  _event: AnalyticsEventName | string,
  _properties: Record<string, unknown> = {}
): void {
  /* no-op */
}

export function captureAIUsageServer(
  _email: string,
  _props: {
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
  /* no-op */
}
