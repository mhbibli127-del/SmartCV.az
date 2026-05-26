export type {
  AnalyticsEventName,
  AnalyticsEventMap,
  AnalyticsEventPayload,
  AIUsageProps,
  ResumeGeneratedProps,
  ResumeExportedProps,
  TemplateEventProps,
  PortfolioEventProps,
  SubscriptionUpgradeProps,
  OnboardingStepProps,
} from "@/lib/analytics/types";

export {
  trackResumeGenerated,
  trackResumeExported,
  trackTemplateSelected,
  trackTemplateViewed,
  trackTemplateDownloaded,
  trackPortfolioExported,
  trackPortfolioGenerated,
  trackAIUsage,
  trackSubscriptionUpgrade,
  trackOnboardingStep,
  trackPageView,
} from "@/lib/analytics/events";

export { captureAnalyticsEvent, AnalyticsTracker } from "@/lib/analytics/tracker";
export { captureServerEvent, captureAIUsageServer } from "@/lib/analytics/server";
export { initPostHogClient, getPostHogClientSync } from "@/lib/analytics/client";

export {
  isPostHogConfigured,
  isAnalyticsOptedOut,
  setAnalyticsOptOut,
  getPostHogHost,
} from "@/lib/utils/analytics/env";

export { sanitizeAnalyticsProperties } from "@/lib/utils/analytics/sanitize";
