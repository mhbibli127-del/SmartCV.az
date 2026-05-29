/**
 * Legacy plan types — app is fully open; limits are not enforced.
 */

export type UserPlan = "free";
export type SubscriptionStatus = "active";

export const UNLIMITED_CV_LIMIT = 999_999_999;

export function isUserPlan(value: string): value is UserPlan {
  return value === "free";
}

export function getCvLimitForPlan(_plan: UserPlan = "free"): number {
  return UNLIMITED_CV_LIMIT;
}

export function getAiLimitForPlan(_plan: UserPlan = "free"): number {
  return Number.POSITIVE_INFINITY;
}

export function isUnlimitedCvLimit(cvLimit: number): boolean {
  return cvLimit >= UNLIMITED_CV_LIMIT;
}
