import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import { generatePdfBuffer } from "@/lib/pdf-puppeteer";
import { normalizeForExport } from "@/lib/cv-normalizer";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const cvData = body.cvData ?? body.cv ?? body;
    const color = body.color ?? body.accentColor ?? "#18181b";

    const normalized = normalizeForExport(cvData, color);
    const hasContent =
      normalized.fullName !== "My CV" ||
      cvData?.canvas?.elements?.length ||
      cvData?.sections?.length;

    if (!hasContent) {
      return NextResponse.json(
        { message: "Add content before exporting.", fallback: true },
        { status: 400 }
      );
    }

    const { buffer, fileName } = await generatePdfBuffer(cvData, color);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err) {
    console.error("[cv/export]", err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
