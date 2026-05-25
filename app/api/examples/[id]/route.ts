import { NextRequest, NextResponse } from "next/server";
import { getCVExampleBySlug, getCVExampleById } from "@/lib/cv-examples/database";

export const dynamic = "force-dynamic";

/** GET /api/examples/[id] — full CV profile for builder import */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const key = params.id;
  const example =
    getCVExampleBySlug(key) ?? getCVExampleById(key);

  if (!example) {
    return NextResponse.json(
      { error: "Example not found", fallback: true },
      { status: 404 }
    );
  }

  return NextResponse.json({ example });
}
