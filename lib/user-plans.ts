/**
 * SmartCV SaaS plans — server-side source of truth for limits & pricing.
 * Paddle webhook is the ONLY authority for paid plan status.
 */
export type UserPlan = "free" | "basic" | "pro";

export type SubscriptionStatus = "active" | "past_due";

export const USER_PLANS: UserPlan[] = ["free", "basic", "pro"];

/** CV limits enforced server-side (never trust frontend). */
export const PLAN_CV_LIMITS: Record<UserPlan, number> = {
  free: 3,
  basic: 30,
  pro: Number.MAX_SAFE_INTEGER,
};

/** Monthly prices (USD) — display only; billing handled by Paddle. */
export const PLAN_PRICES: Record<UserPlan, number> = {
  free: 0,
  basic: 3.99,
  pro: 9.99,
};

/** Stored in MongoDB when cvLimit represents unlimited (pro plan). */
export const UNLIMITED_CV_LIMIT = 999_999_999;

export function getCvLimitForPlan(plan: UserPlan): number {
  if (plan === "pro") return UNLIMITED_CV_LIMIT;
  return PLAN_CV_LIMITS[plan];
}

export function isUnlimitedCvLimit(cvLimit: number): boolean {
  return cvLimit >= UNLIMITED_CV_LIMIT;
}

export function isUserPlan(value: string | null | undefined): value is UserPlan {
  return USER_PLANS.includes(value as UserPlan);
}

export function planFromPriceId(priceId: string): UserPlan | null {
  const basic =
    process.env.PADDLE_PRICE_BASIC?.trim() ||
    process.env.PADDLE_BASIC_PRICE_ID?.trim();
  const pro =
    process.env.PADDLE_PRICE_PRO?.trim() ||
    process.env.PADDLE_PRO_PRICE_ID?.trim();

  if (priceId === basic) return "basic";
  if (priceId === pro) return "pro";
  return null;
}

export function getPaddlePriceId(plan: "basic" | "pro"): string | null {
  if (plan === "basic") {
    return (
      process.env.PADDLE_PRICE_BASIC?.trim() ||
      process.env.PADDLE_BASIC_PRICE_ID?.trim() ||
      null
    );
  }
  return (
    process.env.PADDLE_PRICE_PRO?.trim() ||
    process.env.PADDLE_PRO_PRICE_ID?.trim() ||
    null
  );
}

/** AI generation limits per plan (server-enforced in lib/ai-limit.ts). */
export const PLAN_AI_LIMITS: Record<UserPlan, number> = {
  free: 3,
  basic: 25,
  pro: Number.MAX_SAFE_INTEGER,
};

export function getAiLimitForPlan(plan: UserPlan): number {
  return PLAN_AI_LIMITS[plan];
}
