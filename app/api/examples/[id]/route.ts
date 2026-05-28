import { NextRequest, NextResponse } from "next/server";
import { getPublishedResumeById } from "@/lib/resume-service";

export const dynamic = "force-dynamic";

type RouteParams = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const resume = await getPublishedResumeById(params.id);
    if (!resume) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ resume });
  } catch (err) {
    console.error("[api/examples/id]", err);
    return NextResponse.json({ error: "Failed to load resume" }, { status: 500 });
  }
}
