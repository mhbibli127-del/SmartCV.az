import { NextRequest, NextResponse } from "next/server";
import { parseJsonBody } from "@/lib/safe-route";
import { getAuthenticatedUser } from "@/lib/session";
import { publishResumeExport } from "@/lib/resume-service";
import { badRequest, handleApiError, unauthorized } from "@/lib/api-errors";
import type { SaveResumeRequest } from "@/types/resume";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return unauthorized();
    }

    const body = (await parseJsonBody(req)) as unknown as SaveResumeRequest;

    if (!body.title?.trim() || !body.templateId?.trim() || !body.content) {
      return badRequest("Invalid payload");
    }

    const resume = await publishResumeExport(user.email, body);

    return NextResponse.json({
      success: true,
      resumeId: resume.id,
      resume,
    });
  } catch (err) {
    return handleApiError(err, "resumes/publish-export POST", "Publish failed");
  }
}
