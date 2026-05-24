import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";
import { emptyCV, normalizeCv } from "@/lib/cv/cv-utils";

export async function POST(req: NextRequest) {
  try {
    const openai = getOpenAI();
    const body = await req.json();
    const text = typeof body?.text === "string" ? body.text.trim() : "";

    if (!text) {
      return NextResponse.json({ cv: JSON.stringify(emptyCV) }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a career AI assistant. Extract structured CV data from the raw text and return only valid JSON with keys: name, email, skills, experience, education.",
        },
        {
          role: "user",
          content: `Extract the CV information from the following content and respond with JSON only:\n\n${text}`,
        },
      ],
      temperature: 0.2,
    });

    const raw = completion.choices?.[0]?.message?.content ?? "";
    const parsed = normalizeCv(raw);

    return NextResponse.json({ cv: JSON.stringify(parsed) });
  } catch {
    return NextResponse.json({ cv: JSON.stringify(emptyCV) }, { status: 500 });
  }
}
