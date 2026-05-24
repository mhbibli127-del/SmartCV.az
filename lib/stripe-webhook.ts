import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { getStripeWebhookSecret } from "@/lib/env";
import {
  findUserIdFromCheckoutSession,
  syncUserFromStripeSubscription,
  revokeUserSubscription,
} from "@/lib/subscription-service";
import prisma from "@/lib/prisma";

/**
 * In-memory idempotency guard. Stripe may deliver the same event multiple
 * times (and we may explicitly retry). For production-grade idempotency you
 * would persist event IDs in a DB table with a unique index — for now an
 * in-process set is sufficient because all our handlers are themselves
 * idempotent (set plan/status on the same row).
 */
const processedEventIds = new Set<string>();
const MAX_TRACKED_EVENTS = 5_000;

function rememberEvent(id: string) {
  if (processedEventIds.size >= MAX_TRACKED_EVENTS) {
    const first = processedEventIds.values().next().value;
    if (first) processedEventIds.delete(first);
  }
  processedEventIds.add(id);
}

/**
 * Shared POST handler for Stripe webhooks. Mounted at both
 * /api/webhook and /api/webhook/stripe — see the route files in app/api/.
 */
export async function handleStripeWebhook(
  req: NextRequest
): Promise<NextResponse> {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error:
          "Stripe is not configured. Set STRIPE_SECRET_KEY in your environment.",
      },
      { status: 503 }
    );
  }

  const webhookSecret = getStripeWebhookSecret();
  if (!webhookSecret) {
    // eslint-disable-next-line no-console
    console.error(
      "[webhook] STRIPE_WEBHOOK_SECRET is missing or a placeholder."
    );
    return NextResponse.json(
      {
        error:
          "Webhook secret not configured. Set STRIPE_WEBHOOK_SECRET in your environment.",
      },
      { status: 500 }
    );
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    // eslint-disable-next-line no-console
    console.error("[webhook] Signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Idempotency: if we've already processed this event, ACK and skip.
  if (processedEventIds.has(event.id)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const userId = await findUserIdFromCheckoutSession(session);
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        if (userId && subscriptionId) {
          const subscription =
            await stripe.subscriptions.retrieve(subscriptionId);
          await syncUserFromStripeSubscription(subscription, userId);

          const customerId =
            typeof session.customer === "string"
              ? session.customer
              : session.customer?.id;

          if (customerId) {
            await prisma.user.update({
              where: { id: userId },
              data: { stripeCustomerId: customerId },
            });
          }
        } else {
          // eslint-disable-next-line no-console
          console.warn(
            "[webhook] checkout.session.completed without resolvable user/subscription",
            { eventId: event.id, userId, subscriptionId }
          );
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncUserFromStripeSubscription(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userIdMeta = subscription.metadata?.userId;
        let userId = userIdMeta ? parseInt(userIdMeta, 10) : NaN;

        if (Number.isNaN(userId)) {
          const customerId =
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer?.id;
          if (customerId) {
            const user = await prisma.user.findFirst({
              where: { stripeCustomerId: customerId },
            });
            userId = user?.id ?? NaN;
          }
        }

        if (!Number.isNaN(userId)) {
          await revokeUserSubscription(userId);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        // Stripe Invoice typings don't always expose `subscription`; access defensively.
        const subscriptionId =
          typeof (invoice as any).subscription === "string"
            ? (invoice as any).subscription
            : (invoice as any).subscription?.id;

        if (subscriptionId) {
          const subscription =
            await stripe.subscriptions.retrieve(subscriptionId);
          await syncUserFromStripeSubscription(subscription);
        }
        break;
      }

      default:
        break;
    }

    rememberEvent(event.id);
    return NextResponse.json({ received: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[webhook] Handler error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
