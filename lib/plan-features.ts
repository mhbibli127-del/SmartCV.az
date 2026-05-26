import type { UserPlan } from "@/lib/user-plans";

/** Feature gates by subscription plan */
export function canAccessPremiumTemplates(plan: UserPlan): boolean {
  return plan === "basic" || plan === "pro";
}

export function canUseCollab(plan: UserPlan): boolean {
  return plan === "pro";
}

export function canExportPng(plan: UserPlan): boolean {
  return plan === "basic" || plan === "pro";
}

export function canExportDocx(plan: UserPlan): boolean {
  return plan === "pro";
}
