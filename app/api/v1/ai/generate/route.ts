import { NextRequest, NextResponse } from "next/server";
import { parseJsonBody } from "@/lib/safe-route";
import { requireAiAccess, recordAiUsage, aiErrorResponse } from "@/lib/ai-route-guard";
import { generateCV } from "@/lib/enterprise/ai/orchestrator";
import { parseAIGenerateBody, TONE_STYLES, SOURCE_TYPES } from "@/lib/enterprise/validation/schemas";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  return NextResponse.json({
    toneStyles: TONE_STYLES,
    sourceTypes: SOURCE_TYPES,
    version: "v1",
  });
}

export async function POST(req: NextRequest) {
  try {
    const email = await requireAiAccess(req);

    const body = await parseJsonBody(req);
    const parsed = parseAIGenerateBody(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const result = await generateCV({
      userId: email,
      sourceType: parsed.data.sourceType,
      input: parsed.data.input,
      toneStyle: parsed.data.toneStyle ?? "modern-tech",
      jobDescription: parsed.data.jobDescription,
      language: parsed.data.language,
      resumeId: parsed.data.resumeId,
    });

    if (result.status === "failed") {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    await recordAiUsage(email);
    return NextResponse.json(result);
  } catch (err) {
    return aiErrorResponse(err);
  }
}
