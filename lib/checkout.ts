import type { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import {
  assertValidLookupKey,
  STRIPE_LOOKUP_KEYS,
  type StripeLookupKey,
} from "@/lib/stripe-config";
import {
  getStripe,
  getOrCreateStripeCustomer,
  isStripeConfigured,
  resolvePriceIdByLookupKey,
} from "@/lib/stripe";
import { getAppUrl } from "@/lib/env";
import prisma from "@/lib/prisma";

export async function createSubscriptionCheckout(req: NextRequest) {
  if (!isStripeConfigured()) {
    return {
      ok: false as const,
      status: 503,
      error:
        "Stripe is not configured. Set STRIPE_SECRET_KEY in .env.local " +
        "(or your hosting provider's environment).",
    };
  }

  const auth = await getAuthenticatedUser(req);
  if (!auth?.email) {
    return { ok: false as const, status: 401, error: "Unauthorized" };
  }

  const body = await req.json().catch(() => ({}));
  const lookupKeyRaw =
    (body.lookupKey as string) ||
    (body.lookup_key as string) ||
    STRIPE_LOOKUP_KEYS.PRO_MONTHLY;

  try {
    assertValidLookupKey(lookupKeyRaw);
  } catch {
    return { ok: false as const, status: 400, error: "Invalid lookup key" };
  }

  const lookupKey = lookupKeyRaw as StripeLookupKey;
  const user = await prisma.user.findUnique({
    where: { email: auth.email.toLowerCase().trim() },
  });

  if (!user?.email) {
    return { ok: false as const, status: 404, error: "User not found" };
  }

  const stripe = getStripe();
  const priceId = await resolvePriceIdByLookupKey(lookupKey);

  const customerId = await getOrCreateStripeCustomer({
    userId: user.id,
    email: user.email,
    name: user.name,
    existingCustomerId: user.stripeCustomerId,
  });

  if (customerId !== user.stripeCustomerId) {
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const appUrl = getAppUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    // Redundant identifier so the webhook can find the user even if
    // metadata is stripped by a future Stripe API change.
    client_reference_id: String(user.id),
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/account?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/pricing?canceled=1`,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    metadata: {
      userId: String(user.id),
      lookupKey,
    },
    subscription_data: {
      metadata: {
        userId: String(user.id),
        lookupKey,
      },
    },
  });

  if (!session.url) {
    return {
      ok: false as const,
      status: 502,
      error: "Stripe did not return a checkout URL",
    };
  }

  return {
    ok: true as const,
    sessionId: session.id,
    url: session.url,
  };
}
