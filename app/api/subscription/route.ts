import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import { findSaasUserByEmail } from "@/lib/saas-user";
import { isUnlimitedCvLimit } from "@/lib/user-plans";

export const dynamic = "force-dynamic";

/** GET — current user's subscription state from MongoDB (server-side truth). */
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await findSaasUserByEmail(auth.email);
    if (!user) {
      return NextResponse.json({
        plan: "free",
        cvUsed: 0,
        cvLimit: 3,
        status: "active",
        usage: { cvCount: 0, aiCount: 0 },
        limits: { maxCV: 3, cvLimit: 3 },
      });
    }

    const unlimited = user.plan === "pro" || isUnlimitedCvLimit(user.cvLimit);

    return NextResponse.json({
      plan: user.plan,
      storedPlan: user.plan,
      subscriptionPlan: user.plan,
      subscriptionStatus: user.status,
      hasActiveSubscription: user.plan === "basic" || user.plan === "pro",
      usage: {
        cvCount: user.cvUsed,
        cvUsed: user.cvUsed,
      },
      limits: {
        maxCV: unlimited ? null : user.cvLimit,
        cvLimit: unlimited ? null : user.cvLimit,
      },
      status: user.status,
    });
  } catch (err) {
    console.error("[subscription GET]", err);
    return NextResponse.json(
      { error: "Failed to load subscription" },
      { status: 500 }
    );
  }
}
