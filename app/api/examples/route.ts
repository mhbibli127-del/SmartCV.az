import { NextRequest, NextResponse } from "next/server";
import {
  CV_EXAMPLES_TOTAL,
  searchCVExamples,
} from "@/lib/cv-examples/database";
import { EXAMPLE_CATEGORIES } from "@/lib/cv-examples/types";

export const dynamic = "force-dynamic";

/** GET /api/examples — real-time searchable examples gallery */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? searchParams.get("search") ?? "";
    const category = searchParams.get("category") ?? undefined;
    const page = parseInt(searchParams.get("page") ?? "1", 10) || 1;
    const limit = parseInt(searchParams.get("limit") ?? "24", 10) || 24;

    const result = searchCVExamples({ q, category, page, limit });

    return NextResponse.json({
      examples: result.examples,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      catalogTotal: CV_EXAMPLES_TOTAL,
      categories: ["All", ...EXAMPLE_CATEGORIES],
    });
  } catch (err) {
    console.error("[api/examples]", err);
    return NextResponse.json({
      examples: [],
      total: 0,
      page: 1,
      limit: 24,
      totalPages: 1,
      catalogTotal: CV_EXAMPLES_TOTAL,
      categories: ["All"],
      _fallback: true,
    });
  }
}
