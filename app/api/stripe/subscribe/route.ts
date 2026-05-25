import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Stripe removed — use POST /api/paddle/checkout */
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { error: "Stripe subscriptions are disabled. Use Paddle checkout instead." },
    { status: 410 }
  );
}
