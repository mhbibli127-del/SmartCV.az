import { NextRequest, NextResponse } from "next/server";
import { parseJsonBody } from "@/lib/safe-route";
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
    const body = await parseJsonBody(req);
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

    await incrementAiUsed(user.email).catch(() => {});

    return NextResponse.json({ cv: JSON.stringify(parsed) });
  } catch {
    return NextResponse.json({ cv: JSON.stringify(emptyCV) }, { status: 500 });
  }
}
