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
    const jobDescription = typeof body?.jobDescription === "string" ? body.jobDescription : "";

    if (!cv) {
      return NextResponse.json({ error: "CV required" }, { status: 400 });
    }
    if (!jobDescription.trim()) {
      return NextResponse.json({ error: "Job description required" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert career optimizer. Rewrite the CV to align with the provided job description, emphasize relevant keywords, and improve bullet points with measurable impact. Return JSON with name, email, skills, experience, education, summary.",
        },
        {
          role: "user",
          content: `Original CV: ${JSON.stringify(cv)}\n\nJob Description: ${jobDescription}`,
        },
      ],
      temperature: 0.35,
    });

    const raw = completion.choices?.[0]?.message?.content ?? "";
    const parsed = normalizeCv(raw);

    await recordAiUsage(email);

    return NextResponse.json(parsed);
  } catch (err) {
    return aiErrorResponse(err);
  }
}
