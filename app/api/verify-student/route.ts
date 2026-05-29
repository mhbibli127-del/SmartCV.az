import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import {
  validateStudentId,
  checkStudentEmailDomain,
} from "@/lib/student-verification";
import { getUserPlanRecord } from "@/lib/plan-service";

export const dynamic = "force-dynamic";

/** GET — current student verification status */
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const record = await getUserPlanRecord(auth.email);
    if (!record) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      plan: record.plan,
      effectivePlan: record.effectivePlan,
      studentVerified: record.studentVerified,
      studentId: record.studentId ? maskStudentId(record.studentId) : null,
      verificationStatus: record.verificationStatus,
      studentEmailDomain: record.studentEmailDomain,
      cvUsed: record.cvUsed,
      cvLimit: record.cvLimit,
    });
  } catch (err) {
    console.error("[verify-student GET]", err);
    return NextResponse.json(
      { error: "Failed to load verification status", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * POST — submit student ID for verification.
 * Sets verificationStatus = pending; admin must approve.
 * Optional: flags university email domains for expedited review.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      studentId?: string;
    };

    const validation = validateStudentId(body.studentId ?? "");
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const email = auth.email.toLowerCase().trim();
    const domainCheck = checkStudentEmailDomain(email);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (existing.verificationStatus === "verified" && existing.studentVerified) {
      return NextResponse.json(
        { error: "Student status already verified." },
        { status: 409 }
      );
    }

    if (existing.verificationStatus === "pending") {
      return NextResponse.json(
        {
          error: "Verification already pending admin review.",
          verificationStatus: "pending",
        },
        { status: 409 }
      );
    }

    const duplicate = await prisma.user.findFirst({
      where: {
        studentId: validation.normalized,
        NOT: { id: existing.id },
        verificationStatus: { in: ["pending", "verified"] },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "This student ID is already registered to another account." },
        { status: 409 }
      );
    }

    await prisma.user.update({
      where: { id: existing.id },
      data: {
        studentId: validation.normalized,
        verificationStatus: "pending",
        studentVerified: false,
        studentEmailDomain: domainCheck.domain || null,
        plan: existing.plan === "student" ? "student" : existing.plan,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Student verification submitted. An admin will review your request.",
      verificationStatus: "pending",
      studentId: maskStudentId(validation.normalized),
      domainCheck: {
        domain: domainCheck.domain,
        isUniversityDomain: domainCheck.isUniversityDomain,
        hint: domainCheck.adminHint,
      },
    });
  } catch (err) {
    console.error("[verify-student POST]", err);
    return NextResponse.json(
      { error: "Failed to submit verification" },
      { status: 500 }
    );
  }
}

function maskStudentId(id: string): string {
  if (id.length <= 4) return "****";
  return `${id.slice(0, 2)}${"*".repeat(id.length - 4)}${id.slice(-2)}`;
}
