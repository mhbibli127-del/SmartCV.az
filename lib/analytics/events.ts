import type {
  AIUsageProps,
  AnalyticsEventMap,
  AnalyticsEventName,
  OnboardingStepProps,
  PortfolioEventProps,
  ResumeExportedProps,
  ResumeGeneratedProps,
  SubscriptionUpgradeProps,
  TemplateEventProps,
} from "@/lib/analytics/types";
import { captureAnalyticsEvent } from "@/lib/analytics/tracker";

function capture<T extends AnalyticsEventName>(
  event: T,
  properties: AnalyticsEventMap[T]
): void {
  void captureAnalyticsEvent(event, properties as Record<string, unknown>);
}

export function trackResumeGenerated(props: ResumeGeneratedProps): void {
  capture("resume_generated", props);
}

export function trackResumeExported(props: ResumeExportedProps): void {
  capture("resume_exported", props);
}

export function trackTemplateSelected(props: TemplateEventProps): void {
  capture("template_selected", props);
}

export function trackTemplateViewed(props: TemplateEventProps): void {
  capture("template_view", props);
}

export function trackTemplateDownloaded(props: TemplateEventProps): void {
  capture("template_download", props);
}

export function trackPortfolioExported(props: PortfolioEventProps): void {
  capture("portfolio_exported", props);
}

export function trackPortfolioGenerated(props: PortfolioEventProps): void {
  capture("portfolio_generated", props);
}

export function trackAIUsage(props: AIUsageProps): void {
  capture("ai_usage", props);
  capture(
    props.success ? "ai_generation_success" : "ai_generation_failure",
    props
  );
}

export function trackSubscriptionUpgrade(props: SubscriptionUpgradeProps): void {
  capture("subscription_upgrade", props);
}

export function trackOnboardingStep(props: OnboardingStepProps): void {
  capture("onboarding_step", props);
}

export function trackPageView(page: string): void {
  capture("page_view", { page });
}
