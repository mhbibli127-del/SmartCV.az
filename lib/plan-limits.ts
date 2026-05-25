/**
 * Server-side CV limit enforcement.
 * Delegates to lib/plan-service.ts (free | student | basic | pro).
 */
import {
  checkCanCreateCV as checkCanCreateCVService,
  getUserPlanRecord,
} from "@/lib/plan-service";
import type { UserPlan } from "@/lib/user-plans";
import { countUserCVsMongo } from "@/lib/cv-service";

export type { UserPlan };
export type AppPlan = UserPlan;

export { checkCanCreateCVService as checkCanCreateCV, getUserPlanRecord };

/** @deprecated Use getUserPlanRecord().effectivePlan */
export async function getUserPlan(email: string): Promise<UserPlan> {
  const record = await getUserPlanRecord(email);
  return record?.effectivePlan ?? "free";
}

/** Count CVs owned by the user (MongoDB source of truth). */
export async function countUserCVs(email: string): Promise<number> {
  const cleanEmail = email.trim().toLowerCase();
  const count = await countUserCVsMongo(cleanEmail);
  return count;
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
