import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import { getCVById, getLatestDraft } from "@/lib/cv-service";
import { hydrateCvData } from "@/lib/cv-hydration";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function toClientCvData(cv: Awaited<ReturnType<typeof getCVById>>) {
  if (!cv) return null;
  const raw = {
    id: cv.id,
    templateId: cv.templateId,
    templateName: cv.content.templateName,
    sections: cv.content.sections ?? [],
    canvas: cv.content.canvas,
    mode: cv.content.mode ?? "form",
    metadata: cv.content.metadata ?? { version: 1 },
    generatorData: cv.content.generatorData as Record<string, unknown> | undefined,
    status: cv.status,
  };
  return hydrateCvData(raw);
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cvId = req.nextUrl.searchParams.get("id");

    if (cvId) {
      const cv = await getCVById(user.email, cvId);
      if (!cv) {
        return NextResponse.json({ cvData: null }, { status: 404 });
      }
      return NextResponse.json({ cvData: toClientCvData(cv), cv });
    }

    const draft = await getLatestDraft(user.email);
    if (draft) {
      return NextResponse.json({ cvData: toClientCvData(draft) });
    }

    logger.info("No CV found", "cv-api", { userId: user.email });
    return NextResponse.json({ cvData: null });
  } catch (error) {
    logger.error("Error fetching CV:", "cv-api", error as Error);
    return NextResponse.json({ error: "Failed to fetch CV" }, { status: 500 });
  }
}
