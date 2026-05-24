import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import { findUserByEmail } from "@/lib/users";
import { dbPlanToAppPlan } from "@/lib/subscription-service";
import { countUserCVs } from "@/lib/plan-limits";
import { PLAN_LIMITS } from "@/lib/plans";

function subscriptionFields(user: NonNullable<Awaited<ReturnType<typeof findUserByEmail>>>) {
  if ("subscriptionPlan" in user) {
    return {
      subscriptionPlan: user.subscriptionPlan,
      subscriptionStatus: user.subscriptionStatus,
      stripePriceLookupKey: user.stripePriceLookupKey,
      subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
    };
  }
  return {
    subscriptionPlan: "free" as string | null,
    subscriptionStatus: "inactive" as string | null,
    stripePriceLookupKey: null as string | null,
    subscriptionCurrentPeriodEnd: null as Date | null,
  };
}

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = auth.email.toLowerCase().trim();
    const user = await findUserByEmail(email);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const sub = subscriptionFields(user);

    const storedPlan = dbPlanToAppPlan(sub.subscriptionPlan);
    const isActive =
      sub.subscriptionStatus === "active" ||
      sub.subscriptionStatus === "trialing";

    const effectivePlan: "free" | "pro" = isActive ? storedPlan : "free";
    const limits = PLAN_LIMITS[effectivePlan] ?? PLAN_LIMITS.free;

    let cvCount = 0;
    try {
      cvCount = await countUserCVs(email);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("[subscription GET] failed to count CVs", err);
    }

    const cvLimit = Number.isFinite(limits.maxCV) ? limits.maxCV : null;

    return NextResponse.json({
      plan: effectivePlan,
      subscriptionPlan: isActive ? sub.subscriptionPlan : "free",
      subscriptionStatus: sub.subscriptionStatus ?? "inactive",
      lookupKey: sub.stripePriceLookupKey,
      currentPeriodEnd: sub.subscriptionCurrentPeriodEnd,
      hasActiveSubscription: isActive && effectivePlan !== "free",
      usage: {
        cvCount,
      },
      limits: {
        maxCV: cvLimit,
      },
    });
  } catch (err) {
    console.error("[subscription GET]", err);
    return NextResponse.json(
      { error: "Failed to load subscription" },
      { status: 500 }
    );
  }
}
