import { NextRequest, NextResponse } from "next/server";
import { createNotification, notificationMessages } from "@/lib/notifications";
import { getAuthenticatedUser } from "@/lib/session";
import { logger } from "@/lib/logger";
import { syncAndIncrementCvUsed } from "@/lib/cv-limit";
import { upsertSaasUserOnAuth } from "@/lib/saas-user";
import { updateCVById, getLatestDraft } from "@/lib/cv-service";
import { buildContentFromPayload, titleFromContent } from "@/lib/cv-normalizer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await upsertSaasUserOnAuth({ email: user.email, name: user.name });

    const body = await req.json().catch(() => ({}));
    const { cvData, cvId } = body;

    if (!cvData || typeof cvData !== "object") {
      return NextResponse.json({ error: "cvData required" }, { status: 400 });
    }

    const content = buildContentFromPayload(cvData as Record<string, unknown>);
    let targetId = cvId as string | undefined;

    if (targetId) {
      await updateCVById(user.email, targetId, {
        content,
        status: "completed",
        title: titleFromContent(content),
      });
    } else {
      const draft = await getLatestDraft(user.email);
      if (draft?.id) {
        targetId = draft.id;
        await updateCVById(user.email, draft.id, {
          content,
          status: "completed",
          title: titleFromContent(content),
        });
      }
    }

    const notification = await createNotification({
      userId: user.email,
      type: "resume_complete",
      title: notificationMessages.resumeComplete.title,
      message: notificationMessages.resumeComplete.message,
    });

    logger.info("CV marked completed", "cv-complete", { userId: user.email, cvId: targetId });

    await syncAndIncrementCvUsed(user.email).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Resume marked as completed",
      notification,
      cvId: targetId,
    });
  } catch (error) {
    logger.error("Error completing CV:", "cv-complete", error as Error);
    return NextResponse.json({ error: "Failed to complete resume" }, { status: 500 });
  }
}
