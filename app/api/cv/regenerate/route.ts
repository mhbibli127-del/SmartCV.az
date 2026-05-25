import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import { generatePDF } from "@/lib/pdfGenerator";
import { assertCanUseAI, incrementAiUsed } from "@/lib/ai-limit";
import { getOpenAI } from "@/lib/openai";

export const dynamic = "force-dynamic";

/** POST /api/cv/regenerate — AI improve CV from prompt or existing data */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const aiCheck = await assertCanUseAI(user.email);
    if (!aiCheck.allowed) {
      return NextResponse.json({ error: aiCheck.error, code: aiCheck.code }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { cvData, prompt, targetRole } = body;

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an elite CV writer (Canva + Notion AI level). Regenerate/improve the CV. Return JSON with: summary, experience[], education[], skills[], achievements[], personal{fullName,title,email,phone,location}. Use quantified achievements.",
        },
        {
          role: "user",
          content: JSON.stringify({
            instruction: prompt || "Regenerate this CV to be more impactful and ATS-optimized.",
            targetRole: targetRole || cvData?.personal?.title,
            currentCv: cvData,
          }),
        },
      ],
      temperature: 0.45,
      response_format: { type: "json_object" },
    });

    const improved = JSON.parse(completion.choices[0]?.message?.content ?? "{}");
    await incrementAiUsed(user.email).catch(() => {});

    return NextResponse.json({
      success: true,
      cv: improved,
      version: Date.now(),
    });
  } catch (err) {
    console.error("[cv/regenerate]", err);
    return NextResponse.json(
      {
        success: false,
        message: "Regeneration unavailable — your current CV is unchanged.",
        cv: null,
      },
      { status: 200 }
    );
  }
}
