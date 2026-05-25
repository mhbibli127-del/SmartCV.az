import { NextRequest, NextResponse } from "next/server";
import { DatabaseOperations } from "@/lib/models";
import {
  createNotification,
  notificationMessages,
} from "@/lib/notifications";
import { getAuthenticatedUser } from "@/lib/session";
import { logger } from "@/lib/logger";
import { assertCanCreateCV, syncAndIncrementCvUsed } from "@/lib/cv-limit";
import { upsertSaasUserOnAuth } from "@/lib/saas-user";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await upsertSaasUserOnAuth({ email: user.email, name: user.name });

    const { cvData } = await req.json().catch(() => ({}));

    if (cvData) {
      let existingCompletedWillBeUpdated = false;
      try {
        const existing = await DatabaseOperations.getUserCVs(user.email);
        existingCompletedWillBeUpdated = existing.some(
          (c) => c.status === "completed"
        );
      } catch {
        /* Mongo optional */
      }

      const decision = await assertCanCreateCV(user.email, {
        existingCvWillBeUpdated: existingCompletedWillBeUpdated,
      });
      if (!decision.allowed) {
        return NextResponse.json(
          {
            error: decision.error,
            code: decision.code,
            upgradeRequired: decision.code === "CV_LIMIT_REACHED",
            plan: decision.user.plan,
            cvCount: decision.user.cvUsed,
            cvLimit: decision.user.cvLimit,
          },
          { status: 403 }
        );
      }

      await DatabaseOperations.upsertUserCV({
        userId: user.email,
        userEmail: user.email,
        templateId: cvData.templateId || 1,
        data: {
          sections: cvData.sections,
          templateName: cvData.templateName,
          metadata: cvData.metadata,
          generatorData: cvData.generatorData,
        },
        status: "completed",
      });
    } else {
      await DatabaseOperations.completeUserCV(user.email);
    }

    const notification = await createNotification({
      userId: user.email,
      type: "resume_complete",
      title: notificationMessages.resumeComplete.title,
      message: notificationMessages.resumeComplete.message,
    });

    logger.info("CV marked completed", "cv-complete", { userId: user.email });

    try {
      await syncAndIncrementCvUsed(user.email);
    } catch {
      /* non-blocking */
    }

    return NextResponse.json({
      success: true,
      message: "Resume marked as completed",
      notification,
    });
  } catch (error) {
    logger.error("Error completing CV:", "cv-complete", error as Error);
    return NextResponse.json(
      { error: "Failed to complete resume" },
      { status: 500 }
    );
  }
}
