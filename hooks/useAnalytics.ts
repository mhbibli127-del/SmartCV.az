"use client";

import { useCallback, useMemo } from "react";
import { AnalyticsTracker } from "@/lib/analytics/tracker";
import {
  trackAIUsage as emitAIUsage,
  trackOnboardingStep as emitOnboardingStep,
  trackPortfolioExported as emitPortfolioExported,
  trackPortfolioGenerated as emitPortfolioGenerated,
  trackResumeExported as emitResumeExported,
  trackResumeGenerated as emitResumeGenerated,
  trackSubscriptionUpgrade as emitSubscriptionUpgrade,
  trackTemplateSelected as emitTemplateSelected,
} from "@/lib/analytics/events";
import type {
  AIUsageProps,
  OnboardingStepProps,
  PortfolioEventProps,
  ResumeExportedProps,
  ResumeGeneratedProps,
  SubscriptionUpgradeProps,
  TemplateEventProps,
} from "@/lib/analytics/types";

/**
 * Primary React hook for product analytics.
 * Backward-compatible with legacy tracker methods + new typed helpers.
 */
export function useAnalytics() {
  const tracker = useMemo(() => AnalyticsTracker.getInstance(), []);

  const trackPageView = useCallback((page: string) => tracker.trackPageView(page), [tracker]);
  const trackButtonClick = useCallback(
    (buttonName: string, buttonId: string, page: string) =>
      tracker.trackButtonClick(buttonName, buttonId, page),
    [tracker]
  );
  const trackTemplateView = useCallback(
    (templateId: number, templateTitle: string, category: string) =>
      tracker.trackTemplateView(templateId, templateTitle, category),
    [tracker]
  );
  const trackTemplateDownload = useCallback(
    (templateId: number, templateTitle: string, category: string) =>
      tracker.trackTemplateDownload(templateId, templateTitle, category),
    [tracker]
  );
  const trackTemplateSelect = useCallback(
    (templateId: number, templateTitle: string, category: string) =>
      tracker.trackTemplateSelect(templateId, templateTitle, category),
    [tracker]
  );
  const trackCVCreation = useCallback(
    (templateId: number, cvData: Record<string, unknown> | object) =>
      tracker.trackCVCreation(templateId, cvData as Record<string, unknown>),
    [tracker]
  );
  const trackSearch = useCallback(
    (query: string, resultsCount: number) => tracker.trackSearch(query, resultsCount),
    [tracker]
  );
  const trackFilterChange = useCallback(
    (filterType: string, filterValue: string) =>
      tracker.trackFilterChange(filterType, filterValue),
    [tracker]
  );
  const trackAIRecommendation = useCallback(
    (recommendation: string) => tracker.trackAIRecommendation(recommendation),
    [tracker]
  );
  const trackError = useCallback(
    (error: Error, context: string) => tracker.trackError(error, context),
    [tracker]
  );
  const trackSessionStart = useCallback(() => tracker.trackSessionStart(), [tracker]);
  const trackSessionEnd = useCallback(() => tracker.trackSessionEnd(), [tracker]);
  const setUserId = useCallback((userId: string) => tracker.setUserId(userId), [tracker]);
  const resetUser = useCallback(() => tracker.resetUser(), [tracker]);

  const trackResumeGenerated = useCallback(
    (props: ResumeGeneratedProps) => emitResumeGenerated(props),
    []
  );
  const trackResumeExported = useCallback(
    (props: ResumeExportedProps) => {
      emitResumeExported(props);
      tracker.trackResumeExported(props.format, Number(props.templateId), props.cvId);
    },
    [tracker]
  );
  const trackTemplateSelected = useCallback(
    (props: TemplateEventProps) => {
      emitTemplateSelected(props);
      if (props.templateId !== undefined) {
        tracker.trackTemplateSelect(
          Number(props.templateId),
          props.templateTitle ?? "",
          props.category ?? ""
        );
      }
    },
    [tracker]
  );
  const trackPortfolioExported = useCallback(
    (props: PortfolioEventProps) => emitPortfolioExported(props),
    []
  );
  const trackPortfolioGenerated = useCallback(
    (props: PortfolioEventProps) => emitPortfolioGenerated(props),
    []
  );
  const trackAIUsage = useCallback(
    (props: AIUsageProps) => {
      emitAIUsage(props);
      tracker.trackAIUsage(props);
    },
    [tracker]
  );
  const trackSubscriptionUpgrade = useCallback(
    (props: SubscriptionUpgradeProps) => {
      emitSubscriptionUpgrade(props);
      tracker.trackSubscriptionUpgrade(props.fromPlan, props.toPlan, props.provider);
    },
    []
  );
  const trackOnboardingStep = useCallback(
    (props: OnboardingStepProps) => {
      emitOnboardingStep(props);
      tracker.trackOnboardingStep(props.step, props.stepIndex, props.completed);
    },
    [tracker]
  );

  return {
    trackPageView,
    trackButtonClick,
    trackTemplateView,
    trackTemplateDownload,
    trackTemplateSelect,
    trackCVCreation,
    trackSearch,
    trackFilterChange,
    trackAIRecommendation,
    trackError,
    trackSessionStart,
    trackSessionEnd,
    setUserId,
    resetUser,
    trackResumeGenerated,
    trackResumeExported,
    trackTemplateSelected,
    trackTemplateViewed: trackTemplateView,
    trackTemplateDownloaded: trackTemplateDownload,
    trackPortfolioExported,
    trackPortfolioGenerated,
    trackAIUsage,
    trackSubscriptionUpgrade,
    trackOnboardingStep,
  };
}
