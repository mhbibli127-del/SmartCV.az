import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import { saveResume } from "@/lib/resume-service";
import { assertDatabaseAvailable } from "@/lib/db-circuit";
import {
  badRequest,
  handleApiError,
  unauthorized,
} from "@/lib/api-errors";
import type { SaveResumeRequest } from "@/types/resume";

export const dynamic = "force-dynamic";
/** Vercel Hobby serverless ceiling — fail fast instead of hanging. */
export const maxDuration = 10;

const MAX_BODY_BYTES = 2 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    assertDatabaseAvailable();

    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return unauthorized();
    }

    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {
      return badRequest("Request body too large");
    }

    let body: SaveResumeRequest;
    try {
      body = JSON.parse(raw) as SaveResumeRequest;
    } catch {
      return badRequest("Invalid JSON body");
    }

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
      updatedAt: resume.updatedAt,
      resume: {
        id: resume.id,
        title: resume.title,
        templateId: resume.templateId,
        templateName: resume.templateName,
        updatedAt: resume.updatedAt,
      },
    });
  } catch (err) {
    return handleApiError(err, "resumes/save POST", "Failed to save resume");
  }
}
