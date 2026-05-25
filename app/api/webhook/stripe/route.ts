import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Stripe removed — use POST /api/webhooks/paddle */
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { error: "Stripe webhooks are disabled. Configure Paddle webhooks at /api/webhooks/paddle" },
    { status: 410 }
  );
}
