import type { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import { createPaddleCheckout, type PaddlePlan } from "@/lib/paddle";

export async function createSubscriptionCheckout(req: NextRequest) {
  const auth = await getAuthenticatedUser(req);
  if (!auth?.email) {
    return { ok: false as const, status: 401, error: "Unauthorized" };
  }

  const body = await req.json().catch(() => ({}));
  const planRaw = (body.plan as string) || "pro";
  const plan: PaddlePlan = planRaw === "basic" ? "basic" : "pro";

  const user = await prisma.user.findUnique({
    where: { email: auth.email.toLowerCase().trim() },
    select: { id: true, email: true },
  });

  if (!user?.email) {
    return { ok: false as const, status: 404, error: "User not found" };
  }

  const result = await createPaddleCheckout({
    plan,
    userId: user.id,
    email: user.email,
  });

  if (!result.ok) {
    return { ok: false as const, status: result.status, error: result.error };
  }

  return {
    ok: true as const,
    url: result.checkoutUrl,
    transactionId: result.transactionId,
  };
}
