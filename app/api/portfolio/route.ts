import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";

function safeParse(value: unknown) {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }
  return value;
}

function stringArray(raw: unknown) {
  if (Array.isArray(raw)) {
    return raw.filter((item) => typeof item === "string");
  }
  return [];
}

export async function POST(req: NextRequest) {
  try {
    const openai = getOpenAI();
    const body = await req.json();
    const cv = body?.cv;

    if (!cv) {
      return NextResponse.json({ projects: [], websiteSections: [] }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a portfolio creator. Build project ideas and website sections from a CV, and return JSON only with projects and websiteSections.",
        },
        {
          role: "user",
          content: `Convert this CV into portfolio content: ${JSON.stringify(cv)}`,
        },
      ],
      temperature: 0.35,
    });

    const raw = completion.choices?.[0]?.message?.content ?? "";
    const parsed = safeParse(raw) as Record<string, unknown>;

    return NextResponse.json({
      projects: stringArray(parsed?.projects ?? parsed?.projectIdeas),
      websiteSections: stringArray(parsed?.websiteSections ?? parsed?.websiteOutline),
    });
  } catch {
    return NextResponse.json({ projects: [], websiteSections: [] }, { status: 500 });
  }
}
