import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import { getOpenAI } from "@/lib/openai";
import { emptyCV, normalizeCv } from "@/lib/cv/cv-utils";
import { assertCanUseAI, incrementAiUsed } from "@/lib/ai-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const aiCheck = await assertCanUseAI(user.email);
    if (!aiCheck.allowed) {
      return NextResponse.json(
        { error: aiCheck.error, code: aiCheck.code },
        { status: 403 }
      );
    }

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

    await incrementAiUsed(user.email).catch(() => {});

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(emptyCV, { status: 500 });
  }
}
