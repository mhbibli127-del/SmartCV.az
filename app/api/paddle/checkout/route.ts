import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import { createPaddleCheckout, type PaddlePlan } from "@/lib/paddle";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as { plan?: string };
    const plan = body.plan as PaddlePlan;

    if (plan !== "basic" && plan !== "pro") {
      return NextResponse.json(
        { error: 'plan must be "basic" or "pro"' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: auth.email.toLowerCase() },
      select: { id: true, email: true },
    });

    if (!user?.email) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const result = await createPaddleCheckout({
      plan,
      userId: user.id,
      email: user.email,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      url: result.checkoutUrl,
      transactionId: result.transactionId,
    });
  } catch (err) {
    console.error("[paddle/checkout]", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
