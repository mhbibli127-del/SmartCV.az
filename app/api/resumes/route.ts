import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import { listUserResumes } from "@/lib/resume-service";
import { handleApiError, unauthorized } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return unauthorized();
    }

    const resumes = await listUserResumes(user.email);
    return NextResponse.json({ resumes, total: resumes.length });
  } catch (err) {
    return handleApiError(err, "resumes GET", "Failed to load resumes");
  }
}
