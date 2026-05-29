import { NextRequest, NextResponse } from "next/server";
import { parseJsonBody } from "@/lib/safe-route";
import { getAuthenticatedUser } from "@/lib/session";
import { analyzeDesign, autoFixDesign } from "@/lib/enterprise/ai/design-intelligence";
import type { EditorElement } from "@/types/cv-document";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await parseJsonBody(req);
    const elements = (body.elements ?? []) as EditorElement[];
    const autoFix = Boolean(body.autoFix);

    const issues = analyzeDesign(elements);
    const fixed = autoFix ? autoFixDesign(elements) : undefined;

    return NextResponse.json({
      issues,
      issueCount: issues.length,
      fixedElements: fixed,
      palette: body.generatePalette
        ? (await import("@/lib/enterprise/ai/design-intelligence")).generateColorPalette(
            body.paletteSeed as string
          )
        : undefined,
    });
  } catch (err) {
    console.error("[v1/ai/design]", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
