/**
 * Server-side plan-limit enforcement.
 *
 * The client tracks usage in localStorage for UX (instant feedback, upgrade
 * modal), but localStorage is trivially bypassable. This module is the
 * source of truth — every API route that creates a new CV or consumes an
 * AI credit must call the corresponding `assertCan*` helper FIRST.
 */
import prisma from "@/lib/prisma";
import { PLAN_LIMITS } from "@/lib/plans";
import { dbPlanToAppPlan } from "@/lib/subscription-service";
import { DatabaseOperations } from "@/lib/models";

export type AppPlan = "free" | "pro";

export interface PlanContext {
  plan: AppPlan;
  cvCount: number;
  cvLimit: number; // Infinity for pro
}

/** Resolve the user's effective plan (free | pro). */
export async function getUserPlan(email: string): Promise<AppPlan> {
  const cleanEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: cleanEmail },
    select: { subscriptionPlan: true, subscriptionStatus: true },
  });

  if (!user) return "free";

  // Only honor the stored plan when the subscription is actually active.
  // Matches /api/subscription so client and server agree.
  const isActive =
    user.subscriptionStatus === "active" ||
    user.subscriptionStatus === "trialing";

  return isActive ? dbPlanToAppPlan(user.subscriptionPlan) : "free";
}

/** Count CVs owned by the user across Mongo + Prisma stores. */
export async function countUserCVs(email: string): Promise<number> {
  const cleanEmail = email.trim().toLowerCase();
  let mongoCount = 0;
  let prismaCount = 0;

  try {
    const cvs = await DatabaseOperations.getUserCVs(cleanEmail);
    mongoCount = Array.isArray(cvs) ? cvs.length : 0;
  } catch {
    // Mongo optional — fall through.
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true },
    });
    if (user) {
      prismaCount = await prisma.cV.count({ where: { userId: user.id } });
    }
  } catch {
    // Prisma should always be available — but don't crash limit checks.
  }

  return mongoCount + prismaCount;
}

/** Build a full plan context object for a user. */
export async function getPlanContext(email: string): Promise<PlanContext> {
  const [plan, cvCount] = await Promise.all([
    getUserPlan(email),
    countUserCVs(email),
  ]);
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
  return { plan, cvCount, cvLimit: limits.maxCV };
}

export type CreateCVDecision =
  | { ok: true; plan: AppPlan; cvCount: number; cvLimit: number }
  | {
      ok: false;
      reason: "limit_reached";
      plan: AppPlan;
      cvCount: number;
      cvLimit: number;
    };

/**
 * Decide whether the user is allowed to create a NEW CV record.
 * `existingCvWillBeUpdated` lets save endpoints distinguish between
 * upserts that update an existing row (always allowed) vs ones that
 * would insert a brand-new row.
 */
export async function checkCanCreateCV(
  email: string,
  options: { existingCvWillBeUpdated?: boolean } = {}
): Promise<CreateCVDecision> {
  const ctx = await getPlanContext(email);

  // Pro plan and updates to existing rows are always allowed.
  if (!Number.isFinite(ctx.cvLimit) || options.existingCvWillBeUpdated) {
    return { ok: true, plan: ctx.plan, cvCount: ctx.cvCount, cvLimit: ctx.cvLimit };
  }

  if (ctx.cvCount >= ctx.cvLimit) {
    return {
      ok: false,
      reason: "limit_reached",
      plan: ctx.plan,
      cvCount: ctx.cvCount,
      cvLimit: ctx.cvLimit,
    };
  }

  return { ok: true, plan: ctx.plan, cvCount: ctx.cvCount, cvLimit: ctx.cvLimit };
}
