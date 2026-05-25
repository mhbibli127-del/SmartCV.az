/**
 * Legacy plan-service bridge — reads MongoDB SaaS user as source of truth.
 */
import prisma from "@/lib/prisma";
import { findSaasUserByEmail, applySubscriptionFromWebhook } from "@/lib/saas-user";
import {
  getCvLimitForPlan,
  getAiLimitForPlan,
  isUserPlan,
  type UserPlan,
} from "@/lib/user-plans";

export type VerificationStatus = "none" | "pending" | "verified" | "rejected";

export interface UserPlanRecord {
  id: number;
  email: string;
  plan: UserPlan;
  cvUsed: number;
  cvLimit: number;
  studentVerified: boolean;
  studentId: string | null;
  verificationStatus: VerificationStatus;
  studentEmailDomain: string | null;
  features: { maxAI: number };
  effectivePlan: UserPlan;
  subscriptionStatus: string | null;
}

function isVerificationStatus(v: string | null | undefined): v is VerificationStatus {
  return v === "none" || v === "pending" || v === "verified" || v === "rejected";
}

export async function getUserPlanRecord(email: string): Promise<UserPlanRecord | null> {
  const saas = await findSaasUserByEmail(email);
  const prismaUser = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!saas && !prismaUser) return null;

  const plan: UserPlan = saas?.plan ?? (isUserPlan(prismaUser?.plan) ? prismaUser!.plan as UserPlan : "free");

  return {
    id: prismaUser?.id ?? 0,
    email: email.trim().toLowerCase(),
    plan,
    cvUsed: saas?.cvUsed ?? prismaUser?.cvUsed ?? 0,
    cvLimit: saas?.cvLimit ?? getCvLimitForPlan(plan),
    studentVerified: prismaUser?.studentVerified ?? false,
    studentId: prismaUser?.studentId ?? null,
    verificationStatus: isVerificationStatus(prismaUser?.verificationStatus)
      ? prismaUser.verificationStatus
      : "none",
    studentEmailDomain: prismaUser?.studentEmailDomain ?? null,
    features: { maxAI: getAiLimitForPlan(plan) },
    effectivePlan: plan,
    subscriptionStatus: saas?.status ?? prismaUser?.subscriptionStatus ?? "active",
  };
}

export async function approveStudentVerification(userId: number) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      studentVerified: true,
      verificationStatus: "verified",
      plan: "free",
    },
  });
}

export async function rejectStudentVerification(userId: number) {
  return prisma.user.update({
    where: { id: userId },
    data: { studentVerified: false, verificationStatus: "rejected" },
  });
}

export async function setUserPlan(userId: number, plan: UserPlan) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { plan },
  });
  if (user.email) {
    await applySubscriptionFromWebhook({
      email: user.email,
      plan,
      status: "active",
    });
  }
  return user;
}

export async function checkCanCreateCV(
  email: string,
  options: { existingCvWillBeUpdated?: boolean } = {}
) {
  const { assertCanCreateCV } = await import("@/lib/cv-limit");
  const result = await assertCanCreateCV(email, options);
  if (result.allowed) {
    return {
      ok: true as const,
      plan: result.user.plan,
      effectivePlan: result.user.plan,
      cvUsed: result.user.cvUsed,
      cvLimit: result.user.cvLimit,
    };
  }
  return {
    ok: false as const,
    reason: "limit_reached" as const,
    plan: result.user.plan,
    effectivePlan: result.user.plan,
    cvUsed: result.user.cvUsed,
    cvLimit: result.user.cvLimit,
  };
}

export async function syncCvUsed(userId: number, cvCount: number) {
  await prisma.user.update({ where: { id: userId }, data: { cvUsed: cvCount } });
}

/** @deprecated Stripe removed — kept for legacy imports */
export function stripeTierToPlan(tier: string | null | undefined): UserPlan {
  if (tier === "basic") return "basic";
  if (tier === "pro" || tier === "starter" || tier === "premium") return "pro";
  return "free";
}
