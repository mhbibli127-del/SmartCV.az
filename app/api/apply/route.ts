import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";
import { normalizeApply } from "@/lib/cv/cv-utils";

export async function POST(req: NextRequest) {
  try {
    const openai = getOpenAI();
    const body = await req.json();
    const cv = body?.cv;
    const jobDescription = typeof body?.jobDescription === "string" ? body.jobDescription : "";

    if (!cv) {
      return NextResponse.json({ coverLetter: "", applicationSummary: "" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an application coach. Generate a simulated cover letter and application summary based on a CV and optional job description.",
        },
        {
          role: "user",
          content: `CV: ${JSON.stringify(cv)}\n\nJob Description: ${jobDescription}`,
        },
      ],
      temperature: 0.4,
    });

    const raw = completion.choices?.[0]?.message?.content ?? "";
    const result = normalizeApply(raw);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ coverLetter: "", applicationSummary: "" }, { status: 500 });
  }
}
