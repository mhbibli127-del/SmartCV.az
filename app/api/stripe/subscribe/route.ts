import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import {
  assertValidLookupKey,
  isStripeLookupKey,
  STRIPE_LOOKUP_KEYS,
  type StripeLookupKey,
} from "@/lib/stripe-config";
import {
  getStripe,
  getOrCreateStripeCustomer,
  isStripeConfigured,
  resolvePriceIdByLookupKey,
} from "@/lib/stripe";
import prisma from "@/lib/prisma";

/** @deprecated Prefer POST /api/checkout with { lookupKey } */
export async function POST(req: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 503 }
      );
    }

    const auth = await getAuthenticatedUser(req);
    if (!auth?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lookupKey, priceId: legacyPriceId } = await req.json();
    const key: StripeLookupKey =
      lookupKey && isStripeLookupKey(lookupKey)
        ? lookupKey
        : STRIPE_LOOKUP_KEYS.PRO_MONTHLY;

    if (lookupKey) {
      try {
        assertValidLookupKey(lookupKey);
      } catch {
        return NextResponse.json({ error: "Invalid lookup key" }, { status: 400 });
      }
    }

    const user = await prisma.user.findUnique({
      where: { email: auth.email.toLowerCase().trim() },
    });
    if (!user?.email) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const stripe = getStripe();
    const resolvedPriceId = legacyPriceId
      ? legacyPriceId
      : await resolvePriceIdByLookupKey(key);

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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer: customerId,
      line_items: [{ price: resolvedPriceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard/account?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing`,
      metadata: { userId: String(user.id), lookupKey: key },
      subscription_data: {
        metadata: { userId: String(user.id), lookupKey: key },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
