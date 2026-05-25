/**
 * AI usage limits — server-side enforcement via MongoDB saas user plan.
 */
import { findSaasUserByEmail } from "@/lib/saas-user";
import { getAiLimitForPlan, type UserPlan } from "@/lib/user-plans";

export const AI_LIMIT_ERROR =
  "AI usage limit reached. Upgrade your plan for more AI generations.";

export type AiLimitResult =
  | { allowed: true; remaining: number | "unlimited"; aiUsed: number }
  | { allowed: false; error: string; code: "AI_LIMIT_REACHED"; aiUsed: number };

export async function assertCanUseAI(email: string): Promise<AiLimitResult> {
  const user = await findSaasUserByEmail(email);
  const plan: UserPlan = user?.plan ?? "free";
  const maxAI = getAiLimitForPlan(plan);

  // AI count tracked locally in Prisma aiUsed if available; fallback to 0
  let aiUsed = 0;
  try {
    const { default: prisma } = await import("@/lib/prisma");
    const dbUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { aiUsed: true },
    });
    aiUsed = dbUser?.aiUsed ?? 0;
  } catch {
    /* optional */
  }

  if (!Number.isFinite(maxAI)) {
    return { allowed: true, remaining: "unlimited", aiUsed };
  }

  if (aiUsed >= maxAI) {
    return {
      allowed: false,
      error: AI_LIMIT_ERROR,
      code: "AI_LIMIT_REACHED",
      aiUsed,
    };
  }

  return { allowed: true, remaining: maxAI - aiUsed, aiUsed };
}

export async function incrementAiUsed(email: string): Promise<number> {
  try {
    const { default: prisma } = await import("@/lib/prisma");
    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, aiUsed: true },
    });
    if (!user) return 0;
    const next = (user.aiUsed ?? 0) + 1;
    await prisma.user.update({ where: { id: user.id }, data: { aiUsed: next } });
    return next;
  } catch {
    return 0;
  }
}
