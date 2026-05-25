import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";
import { normalizeCv } from "@/lib/cv/cv-utils";
import { requireAiAccess, recordAiUsage, aiErrorResponse } from "@/lib/ai-route-guard";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const email = await requireAiAccess(req);
    const openai = getOpenAI();
    const body = await req.json();
    const cv = body?.cv;

    if (!cv) {
      return NextResponse.json({ error: "CV required" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a smart resume editor. Improve the CV by enhancing wording, adding action verbs and metrics, and optimizing it for ATS. Return the improved CV as valid JSON with fields: name, email, skills, experience, education, summary.",
        },
        {
          role: "user",
          content: `Improve this CV data:\n${JSON.stringify(cv)}`,
        },
      ],
      temperature: 0.3,
    });

    const raw = completion.choices?.[0]?.message?.content ?? "";
    const parsed = normalizeCv(raw);

    await recordAiUsage(email);

    return NextResponse.json(parsed);
  } catch (err) {
    return aiErrorResponse(err);
  }
}
