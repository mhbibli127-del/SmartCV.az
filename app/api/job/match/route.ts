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
    const jobDescription =
      typeof body?.jobDescription === "string" ? body.jobDescription : "";

    if (!cv) {
      return NextResponse.json({ error: "CV required", matchScore: 0 }, { status: 400 });
    }

    const jobs =
      Array.isArray(body?.jobs) && body.jobs.length > 0
        ? body.jobs
        : jobDescription
          ? [{ title: "Target role", description: jobDescription }]
          : [];

    if (jobs.length === 0) {
      return NextResponse.json(
        { error: "Job description required", matchScore: 0 },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a career matching engine. Compare a structured CV with job descriptions and return JSON only with matchScore (0-100), missingSkills, and suggestedJobs.",
        },
        {
          role: "user",
          content: `Analyze this CV against job descriptions and return JSON only:\n\nCV: ${JSON.stringify(cv)}\n\nJobs: ${JSON.stringify(jobs)}`,
        },
      ],
      temperature: 0.25,
    });

    const raw = completion.choices?.[0]?.message?.content ?? "";
    const parsed = safeParse(raw) as Record<string, unknown>;

    await recordAiUsage(email);

    const matchScore =
      typeof parsed?.matchScore === "number"
        ? parsed.matchScore
        : Number(parsed?.matchScore) || 0;

    return NextResponse.json({
      matchScore,
      score: matchScore,
      missingSkills: stringArray(parsed?.missingSkills),
      suggestedJobs: stringArray(parsed?.suggestedJobs),
    });
  } catch (err) {
    return aiErrorResponse(err);
  }
}
