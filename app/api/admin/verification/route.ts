import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, AdminAuthError } from "@/lib/admin-auth";
import {
  approveStudentVerification,
  rejectStudentVerification,
  setUserPlan,
} from "@/lib/plan-service";
import { isUserPlan } from "@/lib/user-plans";
import {
  sendEmailAsync,
  sendStudentApprovedEmail,
} from "@/lib/notifications/email-service";

export const dynamic = "force-dynamic";

function adminError(err: unknown) {
  if (err instanceof AdminAuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error("[admin/verification]", err);
  return NextResponse.json({ error: "Admin action failed" }, { status: 500 });
}

/** GET — list pending student verifications */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const pending = await prisma.user.findMany({
      where: { verificationStatus: "pending" },
      select: {
        id: true,
        email: true,
        name: true,
        studentId: true,
        studentEmailDomain: true,
        verificationStatus: true,
        plan: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ pending, total: pending.length });
  } catch (err) {
    return adminError(err);
  }
}

/**
 * POST — approve or reject student verification
 * Body: { userId: number, action: "approve" | "reject" }
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    const body = (await req.json().catch(() => ({}))) as {
      userId?: number;
      action?: string;
    };

    const userId = Number(body.userId);
    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    if (body.action !== "approve" && body.action !== "reject") {
      return NextResponse.json(
        { error: 'action must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (body.action === "approve") {
      const updated = await approveStudentVerification(userId);
      if (updated.email) {
        sendEmailAsync(() =>
          sendStudentApprovedEmail(updated.email!, updated.name)
        );
      }
      console.log(
        `[admin] Student approved userId=${userId} by ${admin.email}`
      );
      return NextResponse.json({
        success: true,
        action: "approve",
        user: {
          id: updated.id,
          email: updated.email,
          plan: updated.plan,
          studentVerified: updated.studentVerified,
          verificationStatus: updated.verificationStatus,
        },
      });
    }

    const updated = await rejectStudentVerification(userId);
    console.log(`[admin] Student rejected userId=${userId} by ${admin.email}`);
    return NextResponse.json({
      success: true,
      action: "reject",
      user: {
        id: updated.id,
        email: updated.email,
        verificationStatus: updated.verificationStatus,
      },
    });
  } catch (err) {
    return adminError(err);
  }
}

/** PATCH — manually change user plan */
export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    const body = (await req.json().catch(() => ({}))) as {
      userId?: number;
      plan?: string;
    };

    const userId = Number(body.userId);
    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    if (!body.plan || !isUserPlan(body.plan)) {
      return NextResponse.json(
        { error: "plan must be one of: free, basic, pro" },
        { status: 400 }
      );
    }

    const updated = await setUserPlan(userId, body.plan);
    console.log(
      `[admin] Plan changed userId=${userId} → ${body.plan} by ${admin.email}`
    );

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        email: updated.email,
        plan: updated.plan,
        studentVerified: updated.studentVerified,
        verificationStatus: updated.verificationStatus,
      },
    });
  } catch (err) {
    return adminError(err);
  }
}
