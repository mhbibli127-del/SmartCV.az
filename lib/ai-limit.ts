/**
 * AI usage — open access (no plan limits).
 */

export const AI_LIMIT_ERROR = "AI usage is temporarily unavailable.";

export type AiLimitResult =
  | { allowed: true; remaining: "unlimited"; aiUsed: number }
  | { allowed: false; error: string; code: "AI_LIMIT_REACHED"; aiUsed: number };

export async function assertCanUseAI(_email: string): Promise<AiLimitResult> {
  return { allowed: true, remaining: "unlimited", aiUsed: 0 };
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
