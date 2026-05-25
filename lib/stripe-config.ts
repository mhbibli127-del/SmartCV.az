/** Stripe Price lookup keys — configure matching keys in Stripe Dashboard */
export const STRIPE_LOOKUP_KEYS = {
  BASIC_MONTHLY: "smartcv_basic_monthly",
  STARTER_MONTHLY: "smartcv_starter_monthly",
  PRO_MONTHLY: "smartcv_pro_monthly",
  PRO_YEARLY: "smartcv_pro_yearly",
} as const;

export type StripeLookupKey =
  (typeof STRIPE_LOOKUP_KEYS)[keyof typeof STRIPE_LOOKUP_KEYS];

export const LOOKUP_KEY_LIST: StripeLookupKey[] = [
  STRIPE_LOOKUP_KEYS.BASIC_MONTHLY,
  STRIPE_LOOKUP_KEYS.STARTER_MONTHLY,
  STRIPE_LOOKUP_KEYS.PRO_MONTHLY,
  STRIPE_LOOKUP_KEYS.PRO_YEARLY,
];

/** Stored on User.subscriptionPlan — maps to app plan tiers */
export type SubscriptionPlanTier = "free" | "basic" | "pro";

export function isStripeLookupKey(value: string): value is StripeLookupKey {
  return (LOOKUP_KEY_LIST as string[]).includes(value);
}

/** Resolve-time validation for legacy routes */
export function assertValidLookupKey(lookupKey: string): asserts lookupKey is StripeLookupKey {
  if (!isStripeLookupKey(lookupKey)) {
    throw new Error(`Invalid lookup key: ${lookupKey}`);
  }
}


/** Maps Stripe lookup key → User.subscriptionPlan tier */
export function lookupKeyToPlanTier(
  lookupKey: string | null | undefined
): SubscriptionPlanTier {
  if (!lookupKey) return "free";
  switch (lookupKey) {
    case STRIPE_LOOKUP_KEYS.BASIC_MONTHLY:
      return "basic";
    case STRIPE_LOOKUP_KEYS.STARTER_MONTHLY:
    case STRIPE_LOOKUP_KEYS.PRO_MONTHLY:
    case STRIPE_LOOKUP_KEYS.PRO_YEARLY:
      return "pro";
    default:
      return "free";
  }
}

export const LOOKUP_KEY_PRICES: Record<StripeLookupKey, string> = {
  [STRIPE_LOOKUP_KEYS.BASIC_MONTHLY]: "$2.99/mo",
  [STRIPE_LOOKUP_KEYS.STARTER_MONTHLY]: "$5.99/mo",
  [STRIPE_LOOKUP_KEYS.PRO_MONTHLY]: "$10/mo",
  [STRIPE_LOOKUP_KEYS.PRO_YEARLY]: "$79/yr",
};
