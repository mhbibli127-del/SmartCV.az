import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import { getOpenAI } from "@/lib/openai";
import { extractTextFromPdf, sanitizePdfText } from "@/lib/pdf-parser";
import { assertCanUseAI, incrementAiUsed } from "@/lib/ai-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const EMPTY_CV = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  website: "",
  title: "",
  targetIndustry: "",
  rawExperience: "",
  rawEducation: "",
  rawSkills: "",
  summary: "",
  experience: [] as unknown[],
  education: [] as unknown[],
  skills: [] as string[],
  achievements: [] as string[],
  source: "pdf_upload",
};

/** POST /api/upload/pdf — parse PDF → structured CV JSON */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const aiCheck = await assertCanUseAI(user.email);
    if (!aiCheck.allowed) {
      return NextResponse.json(
        { ...EMPTY_CV, error: aiCheck.error, code: aiCheck.code },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("pdf") as File | null;

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json(
        { ...EMPTY_CV, message: "Please upload a valid PDF file." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const rawText = sanitizePdfText(await extractTextFromPdf(buffer));

    if (!rawText || rawText.length < 50) {
      return NextResponse.json({
        ...EMPTY_CV,
        message:
          "We couldn't read enough text from this PDF. Try a text-based CV (not a scanned image).",
        partial: true,
      });
    }

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You extract structured CV/resume data. Return valid JSON only. Be precise; infer missing fields conservatively.",
        },
        {
          role: "user",
          content: `Extract CV data from this resume text:\n\n${rawText}\n\nReturn JSON:
{
  "fullName", "email", "phone", "location", "website", "title", "targetIndustry",
  "summary", "rawExperience", "rawEducation", "rawSkills",
  "experience": [{ "title", "company", "startDate", "endDate", "description": [] }],
  "education": [{ "degree", "university", "graduationYear" }],
  "skills": [], "achievements": []
}`,
        },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content ?? "{}");
    await incrementAiUsed(user.email).catch(() => {});

    return NextResponse.json({
      ...EMPTY_CV,
      ...parsed,
      source: "pdf_upload",
      success: true,
    });
  } catch (err) {
    console.error("[upload/pdf]", err);
    return NextResponse.json({
      ...EMPTY_CV,
      message: "PDF processing hit a snag — you can still build your CV manually.",
      partial: true,
    });
  }
}
