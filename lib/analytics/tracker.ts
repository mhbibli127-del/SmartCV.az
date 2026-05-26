import type { AnalyticsEventName } from "@/lib/analytics/types";
import { getPostHogClientSync, initPostHogClient } from "@/lib/analytics/client";
import { sanitizeAnalyticsProperties } from "@/lib/utils/analytics/sanitize";
import {
  isAnalyticsOptedOut,
  isPostHogConfigured,
} from "@/lib/utils/analytics/env";

const LEGACY_EVENT_MAP: Partial<Record<AnalyticsEventName, string>> = {
  template_selected: "template_select",
  resume_generated: "cv_created",
  resume_exported: "cv_export",
  portfolio_exported: "portfolio_export",
  portfolio_generated: "portfolio_generated",
  ai_usage: "ai_generate",
  ai_generation_success: "ai_generate",
  ai_generation_failure: "ai_generate",
  subscription_upgrade: "subscription_upgrade",
};

async function persistLegacyEvent(
  eventType: string,
  data: Record<string, unknown>
): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ eventType, data }),
    });
  } catch {
    /* non-blocking */
  }
}

function capturePostHog(
  event: AnalyticsEventName | string,
  properties: Record<string, unknown>
): void {
  if (!isPostHogConfigured() || isAnalyticsOptedOut()) return;

  const client = getPostHogClientSync();
  if (!client) {
    void initPostHogClient().then((ph) => {
      ph?.capture(event, sanitizeAnalyticsProperties(properties));
    });
    return;
  }

  client.capture(event, sanitizeAnalyticsProperties(properties));
}

/**
 * Unified capture — PostHog (primary) + legacy MongoDB dashboard (secondary).
 */
export async function captureAnalyticsEvent(
  event: AnalyticsEventName | string,
  properties: Record<string, unknown> = {}
): Promise<void> {
  if (typeof window === "undefined") return;
  if (isAnalyticsOptedOut()) return;

  const enriched = {
    ...properties,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    pathname: window.location.pathname,
    referrer: document.referrer || undefined,
  };

  capturePostHog(event, enriched);

  const legacyType =
    LEGACY_EVENT_MAP[event as AnalyticsEventName] ?? event;
  await persistLegacyEvent(legacyType, enriched);
}

export class AnalyticsTracker {
  private static instance: AnalyticsTracker;
  private userId: string | null = null;
  private sessionStartTime = Date.now();

  private constructor() {}

  static getInstance(): AnalyticsTracker {
    if (!AnalyticsTracker.instance) {
      AnalyticsTracker.instance = new AnalyticsTracker();
    }
    return AnalyticsTracker.instance;
  }

  setUserId(userId: string): void {
    this.userId = userId;
    if (isPostHogConfigured() && !isAnalyticsOptedOut()) {
      void initPostHogClient().then((ph) => {
        ph?.identify(userId, { $email: userId });
      });
    }
  }

  resetUser(): void {
    this.userId = null;
    getPostHogClientSync()?.reset();
  }

  private withUser(data: Record<string, unknown> = {}): Record<string, unknown> {
    return {
      ...data,
      userId: this.userId ?? undefined,
      sessionDuration: Date.now() - this.sessionStartTime,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    };
  }

  trackPageView(page: string): void {
    void captureAnalyticsEvent("page_view", this.withUser({ page }));
  }

  trackButtonClick(buttonName: string, buttonId: string, page: string): void {
    void captureAnalyticsEvent(
      "button_click",
      this.withUser({
        elementType: "button",
        elementId: buttonId,
        buttonName,
        buttonId,
        page,
      })
    );
  }

  trackTemplateView(templateId: number, templateTitle: string, category: string): void {
    void captureAnalyticsEvent(
      "template_view",
      this.withUser({
        elementType: "template",
        elementId: String(templateId),
        templateId,
        templateTitle,
        category,
        page: "/dashboard/examples",
      })
    );
  }

  trackTemplateDownload(templateId: number, templateTitle: string, category: string): void {
    void captureAnalyticsEvent(
      "template_download",
      this.withUser({
        elementType: "template",
        elementId: String(templateId),
        templateId,
        templateTitle,
        category,
        page: "/dashboard/examples",
      })
    );
  }

  trackTemplateSelect(templateId: number, templateTitle: string, category: string): void {
    void captureAnalyticsEvent(
      "template_selected",
      this.withUser({
        elementType: "template",
        elementId: String(templateId),
        templateId,
        templateTitle,
        category,
        page: "/dashboard/examples",
      })
    );
  }

  trackCVCreation(templateId: number, cvData: Record<string, unknown>): void {
    void captureAnalyticsEvent(
      "resume_generated",
      this.withUser({
        elementType: "cv",
        templateId,
        hasExperience: Boolean(cvData.rawExperience),
        hasEducation: Boolean(cvData.rawEducation),
        hasSkills: Boolean(cvData.rawSkills),
        targetIndustry: cvData.targetIndustry,
        mode: "form",
        page: "/dashboard/builder",
      })
    );
  }

  trackSearch(query: string, resultsCount: number): void {
    void captureAnalyticsEvent(
      "search",
      this.withUser({
        elementType: "search",
        query,
        resultsCount,
        page: "/dashboard/examples",
      })
    );
  }

  trackFilterChange(filterType: string, filterValue: string): void {
    void captureAnalyticsEvent(
      "filter_change",
      this.withUser({
        elementType: "filter",
        filterType,
        filterValue,
        page: window.location.pathname,
      })
    );
  }

  trackAIRecommendation(recommendation: string): void {
    void captureAnalyticsEvent(
      "ai_recommendation",
      this.withUser({
        elementType: "ai",
        recommendation,
        page: window.location.pathname,
      })
    );
  }

  trackAIUsage(props: {
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
  }): void {
    void captureAnalyticsEvent(
      "ai_usage",
      this.withUser({ ...props, page: window.location.pathname })
    );
  }

  trackResumeExported(format: string, templateId?: number, cvId?: string): void {
    void captureAnalyticsEvent(
      "resume_exported",
      this.withUser({
        format,
        templateId,
        cvId,
        page: window.location.pathname,
      })
    );
  }

  trackSubscriptionUpgrade(fromPlan: string, toPlan: string, provider = "paddle"): void {
    void captureAnalyticsEvent(
      "subscription_upgrade",
      this.withUser({ fromPlan, toPlan, provider, page: "/dashboard/account" })
    );
  }

  trackOnboardingStep(step: string, stepIndex: number, completed?: boolean): void {
    void captureAnalyticsEvent(
      "onboarding_step",
      this.withUser({ step, stepIndex, completed, page: window.location.pathname })
    );
  }

  trackError(error: Error, context: string): void {
    void captureAnalyticsEvent(
      "error",
      this.withUser({
        elementType: "error",
        errorMessage: error.message,
        context,
        page: window.location.pathname,
      })
    );
  }

  trackSessionStart(): void {
    this.sessionStartTime = Date.now();
    void captureAnalyticsEvent(
      "session_start",
      this.withUser({ page: window.location.pathname })
    );
  }

  trackSessionEnd(): void {
    void captureAnalyticsEvent(
      "session_end",
      this.withUser({
        sessionDuration: Date.now() - this.sessionStartTime,
        page: window.location.pathname,
      })
    );
  }
}
