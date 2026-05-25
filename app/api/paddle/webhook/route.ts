import { NextRequest, NextResponse } from "next/server";
import { verifyPaddleWebhook, type PaddleWebhookEvent } from "@/lib/paddle";
import { dispatchPaddleWebhookEvent } from "@/lib/paddle-webhook-handler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/paddle/webhook
 * Paddle webhook — ONLY source of truth for subscription status.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("paddle-signature");

  if (!verifyPaddleWebhook(rawBody, signature)) {
    console.warn("[api/paddle/webhook] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: PaddleWebhookEvent;
  try {
    event = JSON.parse(rawBody) as PaddleWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const result = await dispatchPaddleWebhookEvent(event);
    return NextResponse.json({
      received: true,
      event_type: event.event_type,
      ...result,
    });
  } catch (err) {
    console.error("[api/paddle/webhook]", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
