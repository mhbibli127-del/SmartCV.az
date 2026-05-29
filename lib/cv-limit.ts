/**
 * CV creation — open access (no plan limits).
 */
import { countUserCVs } from "@/lib/plan-limits";
import {
  findSaasUserByEmail,
  incrementCvUsed,
  syncCvUsedFromCount,
  type SaasUserRecord,
} from "@/lib/saas-user";

export const CV_LIMIT_ERROR = "CV creation is temporarily unavailable.";

export type CvLimitResult = { allowed: true; user: SaasUserRecord };

export async function assertCanCreateCV(
  email: string,
  _options: { existingCvWillBeUpdated?: boolean } = {}
): Promise<CvLimitResult> {
  const user = await findSaasUserByEmail(email);
  if (user) return { allowed: true, user };

  return {
    allowed: true,
    user: {
      email: email.trim().toLowerCase(),
      name: "User",
      plan: "free",
      cvUsed: 0,
      cvLimit: 999_999,
      status: "active",
      createdAt: new Date(),
    },
  };
}

export async function syncAndIncrementCvUsed(email: string): Promise<number> {
  const count = await countUserCVs(email);
  await syncCvUsedFromCount(email, count);
  return count;
}

export { incrementCvUsed, findSaasUserByEmail };
