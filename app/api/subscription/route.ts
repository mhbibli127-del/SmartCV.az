import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import { findSaasUserByEmail } from "@/lib/saas-user";
import { isUnlimitedCvLimit, getAiLimitForPlan } from "@/lib/user-plans";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** GET — current user's subscription state from MongoDB (server-side truth). */
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = auth.email.trim().toLowerCase();
    const user = await findSaasUserByEmail(email);

    let aiUsed = 0;
    try {
      const dbUser = await prisma.user.findUnique({
        where: { email },
        select: { aiUsed: true },
      });
      aiUsed = dbUser?.aiUsed ?? 0;
    } catch {
      /* optional */
    }

    if (!user) {
      const freeAiLimit = getAiLimitForPlan("free");
      return NextResponse.json({
        plan: "free",
        cvUsed: 0,
        cvLimit: 3,
        status: "active",
        usage: { cvCount: 0, aiCount: aiUsed },
        limits: {
          maxCV: 3,
          cvLimit: 3,
          maxAI: Number.isFinite(freeAiLimit) ? freeAiLimit : null,
        },
      });
    }

    const unlimited = user.plan === "pro" || isUnlimitedCvLimit(user.cvLimit);
    const aiLimit = getAiLimitForPlan(user.plan);
    const maxAI = Number.isFinite(aiLimit) ? aiLimit : null;

    return NextResponse.json({
      plan: user.plan,
      storedPlan: user.plan,
      subscriptionPlan: user.plan,
      subscriptionStatus: user.status,
      hasActiveSubscription: user.plan === "basic" || user.plan === "pro",
      usage: {
        cvCount: user.cvUsed,
        cvUsed: user.cvUsed,
        aiCount: aiUsed,
        aiUsed,
      },
      limits: {
        maxCV: unlimited ? null : user.cvLimit,
        cvLimit: unlimited ? null : user.cvLimit,
        maxAI,
        aiLimit: maxAI,
      },
      status: user.status,
    });
  } catch (err) {
    console.error("[subscription GET]", err);
    return NextResponse.json(
      { error: "Failed to load subscription" },
      { status: 503 }
    );
  }
}
