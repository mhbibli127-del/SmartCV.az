/**
 * CV limit middleware — delegates to MongoDB SaaS user (server-side enforcement).
 */
import { countUserCVs } from "@/lib/plan-limits";
import {
  assertCVLimit,
  checkCVLimit,
  CV_LIMIT_ERROR,
  incrementCvUsed,
  syncCvUsedFromCount,
  findSaasUserByEmail,
  type SaasUserRecord,
} from "@/lib/saas-user";

export { CV_LIMIT_ERROR, checkCVLimit };
export type { SaasUserRecord };

export type CvLimitResult =
  | { allowed: true; user: SaasUserRecord }
  | {
      allowed: false;
      error: string;
      code: "CV_LIMIT_REACHED";
      user: SaasUserRecord;
    };

/**
 * Assert user may create a new CV.
 * Call BEFORE insert; pass existingCvWillBeUpdated=true for updates (no new slot).
 */
export async function assertCanCreateCV(
  email: string,
  options: { existingCvWillBeUpdated?: boolean } = {}
): Promise<CvLimitResult> {
  if (options.existingCvWillBeUpdated) {
    const user = await findSaasUserByEmail(email);
    if (user) return { allowed: true, user };
    const result = await assertCVLimit(email);
    return result.allowed
      ? { allowed: true, user: result.user }
      : { allowed: false, error: result.error, code: "CV_LIMIT_REACHED", user: result.user };
  }

  const result = await assertCVLimit(email);
  if (result.allowed) return { allowed: true, user: result.user };
  return {
    allowed: false,
    error: result.error,
    code: "CV_LIMIT_REACHED",
    user: result.user,
  };
}

/** Recount CVs and sync cvUsed (idempotent). */
export async function syncAndIncrementCvUsed(email: string): Promise<number> {
  const count = await countUserCVs(email);
  await syncCvUsedFromCount(email, count);
  return count;
}

export { incrementCvUsed, findSaasUserByEmail };
