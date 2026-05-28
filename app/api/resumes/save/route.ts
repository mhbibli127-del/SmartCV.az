import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import { saveResume } from "@/lib/resume-service";
import {
  badRequest,
  handleApiError,
  unauthorized,
} from "@/lib/api-errors";
import type { SaveResumeRequest } from "@/types/resume";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return unauthorized();
    }

    const body = (await req.json()) as SaveResumeRequest;

    if (!body.title?.trim()) {
      return badRequest("Title is required");
    }
    if (!body.templateId?.trim()) {
      return badRequest("Template is required");
    }
    if (!body.content) {
      return badRequest("Content is required");
    }

    const resume = await saveResume(user.email, body);

    return NextResponse.json({
      success: true,
      resumeId: resume.id,
      resume,
    });
  } catch (err) {
    return handleApiError(err, "resumes/save POST", "Failed to save resume");
  }
}
