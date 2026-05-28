import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import { getOpenAI } from "@/lib/openai";
import { extractTextFromPdf, sanitizePdfText } from "@/lib/pdf-parser";
import { assertCanUseAI, incrementAiUsed } from "@/lib/ai-limit";
import { PDF_FORM_FIELD_NAMES } from "@/lib/pdf/constants";
import { validatePdfBuffer } from "@/lib/pdf/validation";
import { handleApiError, unauthorized } from "@/lib/api-errors";

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

function resolvePdfFile(formData: FormData): File | null {
  for (const key of PDF_FORM_FIELD_NAMES) {
    const entry = formData.get(key);
    if (entry instanceof File && entry.size > 0) {
      return entry;
    }
  }
  return null;
}

/** POST /api/upload/pdf — parse PDF → structured CV JSON */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return unauthorized();
    }

    const aiCheck = await assertCanUseAI(user.email);
    if (!aiCheck.allowed) {
      return NextResponse.json(
        { ...EMPTY_CV, error: aiCheck.error, code: aiCheck.code },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = resolvePdfFile(formData);

    if (!file) {
      return NextResponse.json(
        {
          ...EMPTY_CV,
          error: "Missing PDF file. Use form field pdf, file, or document.",
          code: "MISSING_FILE",
          message: "Please choose a PDF file to upload.",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const validation = validatePdfBuffer(buffer, file.name || "upload.pdf");

    if (!validation.ok) {
      return NextResponse.json(
        {
          ...EMPTY_CV,
          error: validation.error,
          code: validation.code,
          message: validation.error,
        },
        { status: 400 }
      );
    }

    const rawText = sanitizePdfText(await extractTextFromPdf(buffer));

    if (!rawText || rawText.length < 50) {
      return NextResponse.json({
        ...EMPTY_CV,
        message:
          "We couldn't read enough text from this PDF. Try a text-based CV (not a scanned image).",
        partial: true,
        code: "INSUFFICIENT_TEXT",
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
    const message =
      err instanceof Error && err.message.includes("OPENAI_API_KEY")
        ? "AI parsing is not configured. Set OPENAI_API_KEY to import PDFs."
        : "PDF processing hit a snag — you can still build your CV manually.";

    return NextResponse.json(
      {
        ...EMPTY_CV,
        message,
        partial: true,
        code: "PROCESSING_ERROR",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "POST multipart/form-data with field pdf (or file / document).",
    maxBytes: 10 * 1024 * 1024,
    accept: "application/pdf,.pdf",
  });
}
