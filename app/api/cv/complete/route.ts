import { NextRequest, NextResponse } from "next/server";
import { DatabaseOperations } from "@/lib/models";
import {
  createNotification,
  notificationMessages,
} from "@/lib/notifications";
import { getAuthenticatedUser } from "@/lib/session";
import { logger } from "@/lib/logger";
import { checkCanCreateCV } from "@/lib/plan-limits";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cvData } = await req.json().catch(() => ({}));

    // If we're inserting a "completed" CV (with cvData), enforce the limit
    // unless the user already has a completed row that would just be updated.
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

      const decision = await checkCanCreateCV(user.email, {
        existingCvWillBeUpdated: existingCompletedWillBeUpdated,
      });
      if (!decision.ok) {
        return NextResponse.json(
          {
            error:
              "You have reached the free plan limit of 1 CV. Upgrade to Pro to create more.",
            code: "CV_LIMIT_REACHED",
            upgradeRequired: true,
            plan: decision.plan,
            cvCount: decision.cvCount,
            cvLimit: decision.cvLimit,
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
      // Just marking an existing draft as completed — no count change.
      await DatabaseOperations.completeUserCV(user.email);
    }

    const notification = await createNotification({
      userId: user.email,
      type: "resume_complete",
      title: notificationMessages.resumeComplete.title,
      message: notificationMessages.resumeComplete.message,
    });

    logger.info("CV marked completed", "cv-complete", { userId: user.email });

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
