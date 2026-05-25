import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Stripe removed — use POST /api/paddle/checkout */
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    {
      error: "Stripe checkout is disabled. Use Paddle: POST /api/paddle/checkout with { plan: 'basic' | 'pro' }",
    },
    { status: 410 }
  );
}
