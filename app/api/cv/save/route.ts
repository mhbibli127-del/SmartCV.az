import { NextRequest, NextResponse } from "next/server";
import { createNotification, notificationMessages } from "@/lib/notifications";
import { getAuthenticatedUser } from "@/lib/session";
import { logger } from "@/lib/logger";
import { assertCanCreateCV, syncAndIncrementCvUsed } from "@/lib/cv-limit";
import { upsertSaasUserOnAuth } from "@/lib/saas-user";
import {
  createCV,
  updateCVById,
  getCVById,
} from "@/lib/cv-service";
import { buildContentFromPayload, titleFromContent } from "@/lib/cv-normalizer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await upsertSaasUserOnAuth({ email: user.email, name: user.name });

    const body = await req.json();
    const { cvData, status = "draft", notify = true, cvId, title } = body;
    const cvStatus = status === "completed" ? "completed" : "draft";

    const content = buildContentFromPayload(cvData ?? {});

    if (cvId) {
      const existing = await getCVById(user.email, cvId);
      if (!existing) {
        return NextResponse.json({ error: "CV not found" }, { status: 404 });
      }

      const updated = await updateCVById(user.email, cvId, {
        title: title ?? titleFromContent(content),
        templateId: cvData?.templateId,
        content,
        status: cvStatus,
      });

      return NextResponse.json({
        success: true,
        cvId,
        status: cvStatus,
        message: "CV updated",
        cv: updated,
      });
    }

    await assertCanCreateCV(user.email);

    const created = await createCV(user.email, {
      title: title ?? titleFromContent(content),
      templateId: cvData?.templateId ?? 1,
      content,
      status: cvStatus,
    });

    let notification = null;
    if (notify) {
      notification = await createNotification({
        userId: user.email,
        type: cvStatus === "completed" ? "resume_complete" : "cv_saved",
        title:
          cvStatus === "completed"
            ? notificationMessages.resumeComplete.title
            : notificationMessages.cvSaved.title,
        message:
          cvStatus === "completed"
            ? notificationMessages.resumeComplete.message
            : notificationMessages.cvSaved.message,
      });
    }

    await syncAndIncrementCvUsed(user.email).catch(() => {});

    logger.info("CV saved", "cv-api", { cvId: created.id, userId: user.email });

    return NextResponse.json({
      success: true,
      cvId: created.id,
      status: cvStatus,
      notification,
      message: "CV saved successfully",
    });
  } catch (error) {
    logger.error("Error saving CV:", "cv-api", error as Error);
    return NextResponse.json({ error: "Failed to save CV" }, { status: 500 });
  }
}
