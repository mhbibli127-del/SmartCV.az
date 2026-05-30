/**
 * Primary analytics entry — legacy dashboard analytics + React hook.
 */
export { useAnalytics } from "@/hooks/useAnalytics";
export {
  AnalyticsTracker,
  captureAnalyticsEvent,
  trackEvent,
  trackButtonClicked,
} from "@/lib/analytics/tracker";
export { captureServerEvent, captureAIUsageServer } from "@/lib/analytics/server";
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
export type {
  AnalyticsEventName,
  AIUsageProps,
  ResumeGeneratedProps,
  ResumeExportedProps,
  TemplateEventProps,
} from "@/lib/analytics/types";
