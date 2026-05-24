export type PlanId = "free" | "starter" | "pro" | "premium";
export type BillingInterval = "monthly" | "yearly";

export interface PlanLimits {
  maxCV: number;
  maxAI: number;
  watermark: boolean;
  jobMatch: boolean;
  skillGap: boolean;
  interviewTrainer: boolean;
  atsScore: boolean;
  multiLanguage: boolean;
  coverLetter: boolean;
  linkedIn: boolean;
}

export interface PlanDefinition {
  id: PlanId;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  popular?: boolean;
  features: string[];
  limits: PlanLimits;
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    maxCV: 1,
    maxAI: 3,
    watermark: true,
    jobMatch: false,
    skillGap: false,
    interviewTrainer: false,
    atsScore: false,
    multiLanguage: false,
    coverLetter: false,
    linkedIn: false,
  },
  starter: {
    maxCV: 5,
    maxAI: 25,
    watermark: false,
    jobMatch: false,
    skillGap: false,
    interviewTrainer: false,
    atsScore: false,
    multiLanguage: false,
    coverLetter: false,
    linkedIn: false,
  },
  pro: {
    maxCV: Infinity,
    maxAI: Infinity,
    watermark: false,
    jobMatch: true,
    skillGap: true,
    interviewTrainer: true,
    atsScore: false,
    multiLanguage: false,
    coverLetter: false,
    linkedIn: false,
  },
  premium: {
    maxCV: Infinity,
    maxAI: Infinity,
    watermark: false,
    jobMatch: true,
    skillGap: true,
    interviewTrainer: true,
    atsScore: true,
    multiLanguage: true,
    coverLetter: true,
    linkedIn: true,
  },
};

export const PLANS: PlanDefinition[] = [
  {
    id: "free",
    name: "Free",
    description: "Get started with AI-powered CV creation.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "1 CV",
      "Basic templates",
      "3 AI uses",
      "Watermark export",
    ],
    limits: PLAN_LIMITS.free,
  },
  {
    id: "starter",
    name: "Starter",
    description: "More CVs and AI power for active job seekers.",
    monthlyPrice: 5.99,
    yearlyPrice: 5.99,
    features: [
      "5 CVs",
      "25 AI uses / month",
      "All templates",
      "No watermark",
    ],
    limits: PLAN_LIMITS.starter,
  },
  {
    id: "pro",
    name: "Pro",
    description: "Everything you need to land your next role.",
    monthlyPrice: 9.99,
    yearlyPrice: 79,
    popular: true,
    features: [
      "Unlimited CVs",
      "All templates",
      "Unlimited AI",
      "Job match",
      "Skill gap analysis",
      "Interview trainer",
      "No watermark",
    ],
    limits: PLAN_LIMITS.pro,
  },
  {
    id: "premium",
    name: "Premium",
    description: "Advanced tools for serious job seekers.",
    monthlyPrice: 15,
    yearlyPrice: 144,
    features: [
      "Everything in Pro",
      "ATS score",
      "Advanced AI rewrite",
      "Multi-language CV",
      "Cover letter generator",
      "LinkedIn optimization",
    ],
    limits: PLAN_LIMITS.premium,
  },
];

export const COMPARISON_FEATURES: {
  label: string;
  free: string | boolean;
  pro: string | boolean;
  premium: string | boolean;
}[] = [
  { label: "CVs", free: "1", pro: "Unlimited", premium: "Unlimited" },
  { label: "AI uses", free: "3", pro: "Unlimited", premium: "Unlimited" },
  { label: "Templates", free: "Basic", pro: "All", premium: "All" },
  { label: "Watermark", free: true, pro: false, premium: false },
  { label: "Job match", free: false, pro: true, premium: true },
  { label: "Skill gap", free: false, pro: true, premium: true },
  { label: "Interview trainer", free: false, pro: true, premium: true },
  { label: "ATS score", free: false, pro: false, premium: true },
  { label: "Multi-language CV", free: false, pro: false, premium: true },
  { label: "Cover letter", free: false, pro: false, premium: true },
  { label: "LinkedIn optimization", free: false, pro: false, premium: true },
];

export function getPlan(id: PlanId): PlanDefinition {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

export function getPlanPrice(
  planId: PlanId,
  interval: BillingInterval
): number {
  const plan = getPlan(planId);
  return interval === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
}

export function formatPlanPrice(
  planId: PlanId,
  interval: BillingInterval
): string {
  const price = getPlanPrice(planId, interval);
  if (price === 0) return "$0";
  return `$${price}`;
}
