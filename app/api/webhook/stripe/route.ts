import { NextRequest } from "next/server";
import { handleStripeWebhook } from "@/lib/stripe-webhook";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Legacy Stripe webhook path. Kept so existing Stripe Dashboard configs
 * keep working. New deployments should point Stripe at /api/webhook.
 */
export async function POST(req: NextRequest) {
  return handleStripeWebhook(req);
}
