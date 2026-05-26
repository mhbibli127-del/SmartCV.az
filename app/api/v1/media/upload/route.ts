import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import { isCloudinaryConfigured } from "@/lib/env";
import { uploadImageFile } from "@/lib/media/cloudinary/upload";
import { validateImageFile } from "@/lib/media/validation";
import type { MediaContext } from "@/types/media";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

const VALID_CONTEXTS = new Set<MediaContext>([
  "avatar",
  "resume",
  "portfolio",
  "template-preview",
  "export",
]);

function parseContext(raw: FormDataEntryValue | null): MediaContext | null {
  if (typeof raw !== "string") return null;
  return VALID_CONTEXTS.has(raw as MediaContext) ? (raw as MediaContext) : null;
}

/**
 * POST /api/v1/media/upload
 * FormData: file (required), context (required), cvId (optional for resume)
 */
export async function POST(req: NextRequest) {
  try {
    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        {
          error: "Media uploads are not configured.",
          code: "CLOUDINARY_NOT_CONFIGURED",
        },
        { status: 503 }
      );
    }

    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const context = parseContext(formData.get("context"));
    const cvId = formData.get("cvId");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing image file.", code: "MISSING_FILE" },
        { status: 400 }
      );
    }

    if (!context) {
      return NextResponse.json(
        {
          error:
            "Invalid context. Use avatar, resume, portfolio, template-preview, or export.",
          code: "INVALID_CONTEXT",
        },
        { status: 400 }
      );
    }

    if (context === "template-preview" && user.email !== "mhbibli127@gmail.com") {
      return NextResponse.json(
        { error: "Template preview uploads require admin access.", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    const validation = validateImageFile(file, context);
    if (!validation.ok) {
      return NextResponse.json(
        { error: validation.error, code: validation.code },
        { status: 400 }
      );
    }

    const result = await uploadImageFile(file, {
      context,
      userId: user.email,
      cvId: typeof cvId === "string" ? cvId : undefined,
      tags: context === "export" ? ["export"] : undefined,
    });

    return NextResponse.json({ success: true, media: result });
  } catch (err) {
    console.error("[media/upload]", err);
    return NextResponse.json(
      { error: "Upload failed. Please try again.", code: "UPLOAD_FAILED" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    version: "v1",
    configured: isCloudinaryConfigured(),
    contexts: ["avatar", "resume", "portfolio", "template-preview", "export"],
  });
}
