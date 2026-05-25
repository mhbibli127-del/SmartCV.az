import prisma from "@/lib/prisma";
import {
  isPaddleSubscriptionActive,
  paddlePlanFromPriceId,
  type PaddleWebhookEvent,
} from "@/lib/paddle";
import type { UserPlan } from "@/lib/user-plans";
import {
  sendEmailAsync,
  sendPlanUpgradeEmail,
} from "@/lib/notifications/email-service";

function resolvePlanFromEvent(event: PaddleWebhookEvent): UserPlan | null {
  const customPlan = event.data?.custom_data?.plan;
  if (customPlan === "basic" || customPlan === "pro") return customPlan;

  const priceId = event.data?.items?.[0]?.price?.id;
  if (priceId) return paddlePlanFromPriceId(priceId);

  return null;
}

export async function handlePaddleSubscriptionCreated(event: PaddleWebhookEvent) {
  const userId = parseInt(event.data?.custom_data?.userId ?? "", 10);
  if (!userId || Number.isNaN(userId)) {
    console.warn("[paddle] subscription_created: missing userId in custom_data");
    return null;
  }

  const plan = resolvePlanFromEvent(event) ?? "basic";
  const subscriptionId = event.data?.id ?? null;
  const customerId = event.data?.customer_id ?? null;
  const status = event.data?.status ?? "active";

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      plan,
      paddleSubscriptionId: subscriptionId,
      paddleCustomerId: customerId,
      paddleSubscriptionStatus: status,
      subscriptionPlan: plan,
      subscriptionStatus: isPaddleSubscriptionActive(status) ? "active" : status,
    },
  });

  if (updated.email && (plan === "basic" || plan === "pro")) {
    sendEmailAsync(() =>
      sendPlanUpgradeEmail(updated.email!, plan, updated.name)
    );
  }

  return updated;
}

export async function handlePaddleSubscriptionUpdated(event: PaddleWebhookEvent) {
  const subscriptionId = event.data?.id;
  if (!subscriptionId) return null;

  const user = await prisma.user.findFirst({
    where: { paddleSubscriptionId: subscriptionId },
  });
  if (!user) {
    console.warn("[paddle] subscription_updated: user not found for", subscriptionId);
    return null;
  }

  const plan = resolvePlanFromEvent(event) ?? (user.plan as UserPlan);
  const status = event.data?.status ?? user.paddleSubscriptionStatus ?? "active";
  const active = isPaddleSubscriptionActive(status);

  return prisma.user.update({
    where: { id: user.id },
    data: {
      plan: active ? plan : "free",
      paddleSubscriptionStatus: status,
      subscriptionPlan: active ? plan : "free",
      subscriptionStatus: active ? "active" : status,
    },
  });
}

export async function handlePaddleSubscriptionCancelled(event: PaddleWebhookEvent) {
  const subscriptionId = event.data?.id;
  if (!subscriptionId) return null;

  const user = await prisma.user.findFirst({
    where: { paddleSubscriptionId: subscriptionId },
  });
  if (!user) return null;

  return prisma.user.update({
    where: { id: user.id },
    data: {
      plan: "free",
      paddleSubscriptionStatus: "cancelled",
      subscriptionPlan: "free",
      subscriptionStatus: "cancelled",
    },
  });
}

export async function dispatchPaddleWebhook(event: PaddleWebhookEvent) {
  const type = (event.event_type ?? "").toLowerCase();

  switch (type) {
    case "subscription.created":
    case "subscription_created":
      return handlePaddleSubscriptionCreated(event);
    case "subscription.updated":
    case "subscription_updated":
      return handlePaddleSubscriptionUpdated(event);
    case "subscription.canceled":
    case "subscription.cancelled":
    case "subscription_canceled":
    case "subscription_cancelled":
      return handlePaddleSubscriptionCancelled(event);
    default:
      console.log("[paddle] Unhandled event type:", type);
      return null;
  }
}
