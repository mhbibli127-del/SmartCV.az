import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";

const defaultJobs = [
  {
    title: "Product Design Lead",
    description:
      "Lead a product design team to execute enterprise SaaS experiences, define UI systems, and optimize conversion funnels for B2B workflows.",
  },
  {
    title: "Growth Product Manager",
    description:
      "Own product roadmaps for high-growth SaaS firms, align feature strategy with user research, and deliver measurable business outcomes.",
  },
  {
    title: "AI Resume Strategist",
    description:
      "Build AI-first resume products and career automation tools for talent acquisition, ATS optimization, and candidate success.",
  },
];

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
    const jobs = Array.isArray(body?.jobs) ? body.jobs : defaultJobs;

    if (!cv) {
      return NextResponse.json({ matchScore: 0, missingSkills: [], suggestedJobs: [] }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a career matching engine. Compare a structured CV with job descriptions and return JSON only with matchScore, missingSkills, and suggestedJobs.",
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

    return NextResponse.json({
      matchScore:
        typeof parsed?.matchScore === "number"
          ? parsed.matchScore
          : Number(parsed?.matchScore) || 0,
      missingSkills: stringArray(parsed?.missingSkills),
      suggestedJobs: stringArray(parsed?.suggestedJobs),
    });
  } catch {
    return NextResponse.json({ matchScore: 0, missingSkills: [], suggestedJobs: [] }, { status: 500 });
  }
}
