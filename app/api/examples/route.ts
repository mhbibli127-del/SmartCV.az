import { NextRequest, NextResponse } from "next/server";
import {
  GALLERY_FILTER_CATEGORIES,
  listPublishedResumes,
} from "@/lib/resume-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? "";
    const category = searchParams.get("category") ?? "All";
    const page = parseInt(searchParams.get("page") ?? "1", 10) || 1;
    const limit = parseInt(searchParams.get("limit") ?? "24", 10) || 24;

    const result = await listPublishedResumes({ q, category, page, limit });

    return NextResponse.json({
      resumes: result.resumes,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      categories: GALLERY_FILTER_CATEGORIES,
    });
  } catch (err) {
    console.error("[api/examples]", err);
    return NextResponse.json({
      resumes: [],
      total: 0,
      page: 1,
      totalPages: 1,
      categories: GALLERY_FILTER_CATEGORIES,
    });
  }
}
