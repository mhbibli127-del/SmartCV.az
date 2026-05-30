import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import { extractTextFromPdf, sanitizePdfText } from "@/lib/pdf-parser";
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

    return NextResponse.json({
      ...EMPTY_CV,
      rawExperience: rawText.slice(0, 12000),
      summary: rawText.slice(0, 500),
      source: "pdf_upload",
      success: true,
      message:
        "PDF mətni çıxarıldı. Bölmələri Studio-da əl ilə düzənləyin.",
      code: "TEXT_ONLY",
    });
  } catch (err) {
    console.error("[upload/pdf]", err);
    const message = "PDF emalında xəta — CV-ni əl ilə yarada bilərsiniz.";

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
