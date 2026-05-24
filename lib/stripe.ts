import Stripe from "stripe";
import {
  type StripeLookupKey,
  isStripeLookupKey,
} from "@/lib/stripe-config";
import { getStripeSecretKey } from "@/lib/env";

let stripeSingleton: Stripe | null = null;

/**
 * Stripe client accessor.
 * Never instantiates at module load — safe for Vercel build.
 */
export function getStripe(): Stripe {
  const key = getStripeSecretKey();

  if (!key) {
    throw new Error(
      "[stripe] STRIPE_SECRET_KEY is missing or a placeholder. " +
        "Set a real Stripe secret key in environment variables."
    );
  }

  if (!stripeSingleton) {
    stripeSingleton = new Stripe(key, {
      apiVersion: "2024-11-20.acacia" as never,
      typescript: true,
    });
  }

  return stripeSingleton as Stripe;
}

export function isStripeConfigured(): boolean {
  return getStripeSecretKey() !== null;
}

export async function resolvePriceIdByLookupKey(
  lookupKey: StripeLookupKey
): Promise<string> {
  const stripe = getStripe();
  const prices = await stripe.prices.list({
    lookup_keys: [lookupKey],
    active: true,
    limit: 1,
  });

  const price = prices.data[0];
  if (!price?.id) {
    throw new Error(
      `No active Stripe price found for lookup key "${lookupKey}". ` +
        "Create the price in Stripe Dashboard with this lookup key."
    );
  }
  return price.id;
}

export async function getOrCreateStripeCustomer(params: {
  userId: number;
  email: string;
  name?: string | null;
  existingCustomerId?: string | null;
}): Promise<string> {
  if (params.existingCustomerId) {
    return params.existingCustomerId;
  }

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: params.email,
    name: params.name ?? undefined,
    metadata: {
      userId: String(params.userId),
    },
  });
  return customer.id;
}

export function assertValidLookupKey(
  lookupKey: string
): asserts lookupKey is StripeLookupKey {
  if (!isStripeLookupKey(lookupKey)) {
    throw new Error(`Invalid lookup key: ${lookupKey}`);
  }
}

/** @deprecated Use getStripe() */
export default null as unknown as Stripe;
