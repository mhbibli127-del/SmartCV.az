import type Stripe from "stripe";
import prisma from "@/lib/prisma";
import { lookupKeyToPlanTier, type SubscriptionPlanTier } from "@/lib/stripe-config";
import { stripeTierToPlan } from "@/lib/plan-service";

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export function resolveLookupKeyFromSubscription(
  subscription: Stripe.Subscription
): string | null {
  const item = subscription.items.data[0];
  if (!item?.price) return null;

  const price = item.price;
  if (price.lookup_key) return price.lookup_key;

  return (price.metadata?.lookup_key as string) ?? null;
}

export async function updateUserSubscription(params: {
  userId: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string | null;
  stripePriceLookupKey?: string | null;
  subscriptionStatus: string;
  subscriptionPlan: SubscriptionPlanTier;
  subscriptionCurrentPeriodEnd?: Date | null;
}) {
  return prisma.user.update({
    where: { id: params.userId },
    data: {
      stripeCustomerId: params.stripeCustomerId,
      stripeSubscriptionId: params.stripeSubscriptionId ?? null,
      stripePriceLookupKey: params.stripePriceLookupKey ?? null,
      subscriptionStatus: params.subscriptionStatus,
      subscriptionPlan: params.subscriptionPlan,
      subscriptionCurrentPeriodEnd: params.subscriptionCurrentPeriodEnd ?? null,
      plan: stripeTierToPlan(params.subscriptionPlan),
    },
  });
}

export async function syncUserFromStripeSubscription(
  subscription: Stripe.Subscription,
  fallbackUserId?: number
) {
  const lookupKey = resolveLookupKeyFromSubscription(subscription);
  const planTier: SubscriptionPlanTier = ACTIVE_STATUSES.has(subscription.status)
    ? lookupKeyToPlanTier(lookupKey)
    : "free";

  const userIdFromMeta = subscription.metadata?.userId;
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

  let user =
    fallbackUserId != null
      ? await prisma.user.findUnique({ where: { id: fallbackUserId } })
      : null;

  if (!user && userIdFromMeta) {
    user = await prisma.user.findUnique({
      where: { id: parseInt(userIdFromMeta, 10) },
    });
  }

  if (!user && customerId) {
    user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
    });
  }

  if (!user) {
    console.warn("[subscription] No user for subscription", subscription.id);
    return null;
  }

  return updateUserSubscription({
    userId: user.id,
    stripeCustomerId: customerId ?? user.stripeCustomerId ?? undefined,
    stripeSubscriptionId: subscription.id,
    stripePriceLookupKey: lookupKey,
    subscriptionStatus: subscription.status,
    subscriptionPlan: planTier,
    // Stripe SDK typings differ by version; compute defensively.
    subscriptionCurrentPeriodEnd:
      // @ts-expect-error older/newer stripe typings
      subscription.current_period_end
        ? // @ts-expect-error older/newer stripe typings
          new Date(subscription.current_period_end * 1000)
        : null,
  });
}

export async function revokeUserSubscription(userId: number) {
  return updateUserSubscription({
    userId,
    stripeSubscriptionId: null,
    stripePriceLookupKey: null,
    subscriptionStatus: "canceled",
    subscriptionPlan: "free",
    subscriptionCurrentPeriodEnd: null,
  });
}

export async function findUserIdFromCheckoutSession(
  session: Stripe.Checkout.Session
): Promise<number | null> {
  // 1) Prefer metadata (set by /api/checkout).
  const metaUserId = session.metadata?.userId;
  if (metaUserId) {
    const id = parseInt(metaUserId, 10);
    if (!Number.isNaN(id)) return id;
  }

  // 2) Fallback to client_reference_id (also set by /api/checkout).
  const refId = session.client_reference_id;
  if (refId) {
    const id = parseInt(refId, 10);
    if (!Number.isNaN(id)) return id;
  }

  // 3) Last resort: look up by Stripe customer ID.
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;

  if (customerId) {
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
    });
    if (user) return user.id;
  }

  return null;
}

/** Map DB subscriptionPlan → legacy frontend plan (free | pro) */
export function dbPlanToAppPlan(
  dbPlan: string | null | undefined
): "free" | "pro" {
  const mapped = stripeTierToPlan(dbPlan);
  return mapped === "pro" ? "pro" : "free";
}
