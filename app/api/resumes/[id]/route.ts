import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import {
  deleteResume,
  duplicateResume,
  getResumeById,
  publishResume,
} from "@/lib/resume-service";
import { handleApiError, unauthorized } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

type RouteParams = { params: { id: string } };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return unauthorized();
    }

    const resume = await getResumeById(user.email, params.id);
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    return NextResponse.json({ resume });
  } catch (err) {
    return handleApiError(err, "resumes/id GET", "Failed to load resume");
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return unauthorized();
    }

    const deleted = await deleteResume(user.email, params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err, "resumes/id DELETE", "Failed to delete resume");
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return unauthorized();
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action as string | undefined;

    if (action === "duplicate") {
      const copy = await duplicateResume(user.email, params.id);
      if (!copy) {
        return NextResponse.json({ error: "Resume not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, resume: copy });
    }

    if (action === "publish") {
      const published = await publishResume(user.email, params.id);
      if (!published) {
        return NextResponse.json({ error: "Resume not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, resume: published });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return handleApiError(err, "resumes/id POST", "Action failed");
  }
}
