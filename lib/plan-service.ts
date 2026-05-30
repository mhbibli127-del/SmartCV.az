/**
 * User plan record — open access; student verification fields retained for admin.
 */
import prisma from "@/lib/prisma";
import { findSaasUserByEmail } from "@/lib/saas-user";
import { getCvLimitForPlan, type UserPlan } from "@/lib/user-plans";
import { countUserCVs } from "@/lib/plan-limits";

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
  features: { maxExports: number };
  effectivePlan: UserPlan;
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

  const plan: UserPlan = "free";
  const cvCount = await countUserCVs(email);

  return {
    id: prismaUser?.id ?? 0,
    email: email.trim().toLowerCase(),
    plan,
    cvUsed: saas?.cvUsed ?? prismaUser?.cvUsed ?? cvCount,
    cvLimit: getCvLimitForPlan(plan),
    studentVerified: prismaUser?.studentVerified ?? false,
    studentId: prismaUser?.studentId ?? null,
    verificationStatus: isVerificationStatus(prismaUser?.verificationStatus)
      ? prismaUser.verificationStatus
      : "none",
    studentEmailDomain: prismaUser?.studentEmailDomain ?? null,
    features: { maxExports: 999 },
    effectivePlan: plan,
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

/** @deprecated Plans are not sold — always stores free */
export async function setUserPlan(userId: number, _plan: UserPlan) {
  return prisma.user.update({
    where: { id: userId },
    data: { plan: "free" },
  });
}

export async function checkCanCreateCV(
  email: string,
  _options: { existingCvWillBeUpdated?: boolean } = {}
) {
  void email;
  return {
    ok: true as const,
    plan: "free" as UserPlan,
    effectivePlan: "free" as UserPlan,
    cvUsed: 0,
    cvLimit: getCvLimitForPlan("free"),
  };
}

export async function syncCvUsed(userId: number, cvCount: number) {
  await prisma.user.update({ where: { id: userId }, data: { cvUsed: cvCount } });
}

export function stripeTierToPlan(_tier: string | null | undefined): UserPlan {
  return "free";
}
