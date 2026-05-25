import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";
import { requireAiAccess, recordAiUsage, aiErrorResponse } from "@/lib/ai-route-guard";

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
    const email = await requireAiAccess(req);
    const openai = getOpenAI();
    const body = await req.json();
    const cv = body?.cv;
    const targetJob = typeof body?.targetJob === "string" ? body.targetJob : "";

    if (!cv) {
      return NextResponse.json({ error: "CV required" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a career gap analyst. Identify missing skills and produce a short roadmap for a target role.",
        },
        {
          role: "user",
          content: `Analyze this CV and the target job role. Return JSON only with missingSkills and roadmap. CV: ${JSON.stringify(cv)}\nTarget Job: ${targetJob}`,
        },
      ],
      temperature: 0.3,
    });

    const raw = completion.choices?.[0]?.message?.content ?? "";
    const parsed = safeParse(raw) as Record<string, unknown>;

    await recordAiUsage(email);

    return NextResponse.json({
      missingSkills: stringArray(parsed?.missingSkills),
      roadmap: stringArray(parsed?.roadmap),
    });
  } catch (err) {
    return aiErrorResponse(err);
  }
}
