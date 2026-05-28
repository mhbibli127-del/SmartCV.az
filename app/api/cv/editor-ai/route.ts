import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import { assertCanUseAI, incrementAiUsed } from "@/lib/ai-limit";
import { getOpenAI } from "@/lib/openai";
import type { AiEditorAction } from "@/types/cv-editor";

export const dynamic = "force-dynamic";

const PROMPTS: Record<AiEditorAction, string> = {
  rewrite:
    "Rewrite the text professionally. Keep the same facts. Return only the rewritten text, no markdown.",
  improve:
    "Improve this CV text with stronger action verbs and quantified impact where possible. Return only the improved text.",
  summary:
    "Write a compelling 3-sentence professional summary for a CV based on the context. Return only the summary text.",
  skills:
    "Suggest 8-12 relevant professional skills as a bullet list (one skill per line). Return only the list.",
  "cover-letter":
    "Write a concise professional cover letter (3 short paragraphs) based on the CV context. Return only the letter text.",
  grammar:
    "Fix grammar, spelling, and punctuation. Return only the corrected text.",
};

/** POST /api/cv/editor-ai — inline AI tools for the CV builder */
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
    const action = body.action as AiEditorAction;
    const text = String(body.text ?? "");
    const context = String(body.context ?? "");

    if (!action || !PROMPTS[action]) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: PROMPTS[action],
        },
        {
          role: "user",
          content: text
            ? `Text:\n${text}\n\nCV context:\n${context.slice(0, 3000)}`
            : `CV context:\n${context.slice(0, 4000)}`,
        },
      ],
      temperature: 0.4,
    });

    const result = completion.choices[0]?.message?.content?.trim() ?? "";
    await incrementAiUsed(user.email).catch(() => {});

    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error("[cv/editor-ai]", err);
    return NextResponse.json(
      { error: "AI service unavailable" },
      { status: 503 }
    );
  }
}
