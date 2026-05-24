import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";
import { emptyCV, normalizeCv } from "@/lib/cv/cv-utils";

export async function POST(req: NextRequest) {
  try {
    const openai = getOpenAI();
    const body = await req.json();
    const cv = body?.cv;
    const jobDescription = typeof body?.jobDescription === "string" ? body.jobDescription : "";

    if (!cv || !jobDescription.trim()) {
      return NextResponse.json(emptyCV, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert career optimizer. Rewrite the CV to align with the provided job description, emphasize relevant keywords, and improve bullet points with measurable impact.",
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

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(emptyCV, { status: 500 });
  }
}
