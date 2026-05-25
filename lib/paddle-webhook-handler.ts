/**
 * Paddle webhook handler — ONLY source of truth for subscription status.
 */
import {
  applySubscriptionFromWebhook,
  downgradeToFree,
  markPastDue,
} from "@/lib/saas-user";
import {
  planFromPriceId,
  type SubscriptionStatus,
  type UserPlan,
} from "@/lib/user-plans";
import {
  sendEmailAsync,
  sendPlanUpgradeEmail,
} from "@/lib/notifications/email-service";

export type PaddleWebhookPayload = {
  event_type?: string;
  event_id?: string;
  data?: {
    id?: string;
    status?: string;
    customer_id?: string;
    customer?: { email?: string };
    custom_data?: { email?: string; plan?: string; userId?: string };
    items?: { price?: { id?: string }; price_id?: string }[];
    subscription_id?: string;
  };
};

function normalizeEventType(raw: string): string {
  return raw.toLowerCase().replace(/\./g, "_");
}

function resolveEmail(event: PaddleWebhookPayload): string | null {
  const data = event.data;
  return (
    data?.custom_data?.email?.trim().toLowerCase() ||
    data?.customer?.email?.trim().toLowerCase() ||
    null
  );
}

function resolvePlan(event: PaddleWebhookPayload): UserPlan {
  const custom = event.data?.custom_data?.plan;
  if (custom === "basic" || custom === "pro") return custom;

  const priceId =
    event.data?.items?.[0]?.price?.id ||
    event.data?.items?.[0]?.price_id;
  if (priceId) {
    const fromPrice = planFromPriceId(priceId);
    if (fromPrice) return fromPrice;
  }
  return "basic";
}

function resolveSubscriptionId(event: PaddleWebhookPayload): string | undefined {
  return event.data?.id || event.data?.subscription_id;
}

export async function dispatchPaddleWebhookEvent(
  event: PaddleWebhookPayload
): Promise<{ handled: boolean; action?: string }> {
  const type = normalizeEventType(event.event_type ?? "");
  const email = resolveEmail(event);
  const plan = resolvePlan(event);
  const subscriptionId = resolveSubscriptionId(event);
  const customerId = event.data?.customer_id;

  switch (type) {
    case "subscription_created":
    case "subscription_activated": {
      if (!email) {
        console.warn("[paddle/webhook] No email for subscription event");
        return { handled: false };
      }
      await applySubscriptionFromWebhook({
        email,
        plan,
        status: "active",
        paddleSubscriptionId: subscriptionId,
        paddleCustomerId: customerId,
      });
      sendEmailAsync(() => sendPlanUpgradeEmail(email, plan));
      return { handled: true, action: `subscription_active:${plan}` };
    }

    case "subscription_updated": {
      if (!email && !subscriptionId) return { handled: false };
      const status: SubscriptionStatus =
        event.data?.status === "past_due" ? "past_due" : "active";
      if (email) {
        await applySubscriptionFromWebhook({
          email,
          plan,
          status,
          paddleSubscriptionId: subscriptionId,
          paddleCustomerId: customerId,
        });
      }
      return { handled: true, action: `subscription_updated:${plan}` };
    }

    case "subscription_canceled":
    case "subscription_cancelled": {
      await downgradeToFree({ email: email ?? undefined, paddleSubscriptionId: subscriptionId });
      return { handled: true, action: "downgraded_to_free" };
    }

    case "transaction_completed": {
      if (!email) return { handled: false };
      await applySubscriptionFromWebhook({
        email,
        plan,
        status: "active",
        paddleSubscriptionId: subscriptionId,
        paddleCustomerId: customerId,
      });
      sendEmailAsync(() => sendPlanUpgradeEmail(email, plan));
      return { handled: true, action: `transaction_completed:${plan}` };
    }

    case "transaction_payment_failed": {
      await markPastDue({
        email: email ?? undefined,
        paddleSubscriptionId: subscriptionId,
      });
      return { handled: true, action: "marked_past_due" };
    }

    default:
      console.log("[paddle/webhook] Unhandled event:", type);
      return { handled: false };
  }
}
