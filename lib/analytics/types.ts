/** Strongly typed analytics event catalog for SmartCV.AZ */

export type AnalyticsEventName =
  | "page_view"
  | "button_click"
  | "template_view"
  | "template_download"
  | "template_selected"
  | "resume_generated"
  | "resume_exported"
  | "portfolio_exported"
  | "portfolio_generated"
  | "search"
  | "filter_change"
  | "ai_recommendation"
  | "ai_usage"
  | "ai_generation_success"
  | "ai_generation_failure"
  | "subscription_upgrade"
  | "onboarding_step"
  | "session_start"
  | "session_end"
  | "error";

export interface BaseEventProps {
  page?: string;
  source?: string;
}

export interface PageViewProps extends BaseEventProps {
  page: string;
}

export interface ButtonClickProps extends BaseEventProps {
  buttonName: string;
  buttonId: string;
  page: string;
}

export interface TemplateEventProps extends BaseEventProps {
  templateId: number | string;
  templateTitle?: string;
  category?: string;
  slug?: string;
}

export interface ResumeGeneratedProps extends BaseEventProps {
  templateId: number | string;
  hasExperience?: boolean;
  hasEducation?: boolean;
  hasSkills?: boolean;
  targetIndustry?: string;
  mode?: "form" | "visual" | "ai";
}

export interface ResumeExportedProps extends BaseEventProps {
  format: "pdf" | "png" | "docx" | string;
  templateId?: number | string;
  cvId?: string;
}

export interface PortfolioEventProps extends BaseEventProps {
  projectCount?: number;
  format?: string;
  cvId?: string;
}

export interface AIUsageProps extends BaseEventProps {
  feature: string;
  action: string;
  model?: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  estimatedCostUsd?: number;
  success: boolean;
  errorCode?: string;
  durationMs?: number;
}

export interface SubscriptionUpgradeProps extends BaseEventProps {
  fromPlan: string;
  toPlan: string;
  provider?: "paddle" | "stripe";
}

export interface OnboardingStepProps extends BaseEventProps {
  step: string;
  stepIndex: number;
  completed?: boolean;
}

export interface SearchProps extends BaseEventProps {
  query: string;
  resultsCount: number;
}

export interface AnalyticsEventMap {
  page_view: PageViewProps;
  button_click: ButtonClickProps;
  template_view: TemplateEventProps;
  template_download: TemplateEventProps;
  template_selected: TemplateEventProps;
  resume_generated: ResumeGeneratedProps;
  resume_exported: ResumeExportedProps;
  portfolio_exported: PortfolioEventProps;
  portfolio_generated: PortfolioEventProps;
  search: SearchProps;
  filter_change: BaseEventProps & { filterType: string; filterValue: string };
  ai_recommendation: BaseEventProps & { recommendation: string };
  ai_usage: AIUsageProps;
  ai_generation_success: AIUsageProps;
  ai_generation_failure: AIUsageProps;
  subscription_upgrade: SubscriptionUpgradeProps;
  onboarding_step: OnboardingStepProps;
  session_start: BaseEventProps;
  session_end: BaseEventProps & { sessionDuration?: number };
  error: BaseEventProps & { errorMessage: string; context: string };
}

export type AnalyticsEventPayload<T extends AnalyticsEventName = AnalyticsEventName> = {
  event: T;
  properties: AnalyticsEventMap[T];
};
