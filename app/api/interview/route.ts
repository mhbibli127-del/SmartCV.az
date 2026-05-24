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

function parseQuestions(raw: unknown) {
  if (Array.isArray(raw)) {
    return raw.map((item) => {
      if (typeof item === "string") return item;
      if (typeof item === "object" && item !== null && typeof (item as any).question === "string") {
        return (item as any).question;
      }
      return "";
    }).filter(Boolean);
  }
  return [];
}

function parseAnswers(raw: unknown) {
  if (Array.isArray(raw)) {
    return raw.map((item) => {
      if (typeof item === "string") return item;
      if (typeof item === "object" && item !== null && typeof (item as any).answer === "string") {
        return (item as any).answer;
      }
      if (typeof item === "object" && item !== null && typeof (item as any).advice === "string") {
        return (item as any).advice;
      }
      return "";
    }).filter(Boolean);
  }
  return [];
}

export async function POST(req: NextRequest) {
  try {
    const openai = getOpenAI();
    const body = await req.json();
    const cv = body?.cv;

    if (!cv) {
      return NextResponse.json({ questions: [], answers: [] }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an interview coach. Generate relevant interview questions and concise answer guidance based on the provided CV.",
        },
        {
          role: "user",
          content: `Prepare interview material for this CV and return JSON only with questions and answers arrays: ${JSON.stringify(cv)}`,
        },
      ],
      temperature: 0.35,
    });

    const raw = completion.choices?.[0]?.message?.content ?? "";
    const parsed = safeParse(raw) as Record<string, unknown>;

    return NextResponse.json({
      questions: parseQuestions(parsed?.questions),
      answers: parseAnswers(parsed?.answers),
    });
  } catch {
    return NextResponse.json({ questions: [], answers: [] }, { status: 500 });
  }
}
