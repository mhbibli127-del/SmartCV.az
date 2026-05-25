/**
 * Server-side CV limit enforcement.
 * Delegates to lib/plan-service.ts (free | student | basic | pro).
 */
import prisma from "@/lib/prisma";
import { DatabaseOperations } from "@/lib/models";
import {
  checkCanCreateCV as checkCanCreateCVService,
  getUserPlanRecord,
} from "@/lib/plan-service";
import type { UserPlan } from "@/lib/user-plans";

export type { UserPlan };
export type AppPlan = UserPlan;

export { checkCanCreateCVService as checkCanCreateCV, getUserPlanRecord };

/** @deprecated Use getUserPlanRecord().effectivePlan */
export async function getUserPlan(email: string): Promise<UserPlan> {
  const record = await getUserPlanRecord(email);
  return record?.effectivePlan ?? "free";
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
    /* Mongo optional */
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
    /* Prisma optional */
  }

  return mongoCount + prismaCount;
}

/** @deprecated Use getUserPlanRecord */
export async function getPlanContext(email: string) {
  const record = await getUserPlanRecord(email);
  if (!record) {
    return { plan: "free" as UserPlan, cvCount: 0, cvLimit: 20 };
  }
  return {
    plan: record.effectivePlan,
    cvCount: record.cvUsed,
    cvLimit: record.cvLimit,
  };
}
