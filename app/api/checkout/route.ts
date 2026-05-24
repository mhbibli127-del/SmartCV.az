import { NextRequest, NextResponse } from "next/server";
import { createSubscriptionCheckout } from "@/lib/checkout";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const result = await createSubscriptionCheckout(req);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({
      sessionId: result.sessionId,
      url: result.url,
    });
  } catch (err) {
    console.error("[checkout]", err);
    const message =
      err instanceof Error ? err.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
