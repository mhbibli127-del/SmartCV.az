import { NextRequest } from "next/server";
import { handleStripeWebhook } from "@/lib/stripe-webhook";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Canonical webhook receiver. Configure this URL in Stripe Dashboard:
 *   https://your-domain.com/api/webhook
 *
 * Verifies the Stripe signature and updates user subscription state in DB.
 */
export async function POST(req: NextRequest) {
  return handleStripeWebhook(req);
}
