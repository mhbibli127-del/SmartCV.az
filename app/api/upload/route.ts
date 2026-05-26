import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import { isCloudinaryConfigured } from "@/lib/env";
import { uploadImageFile } from "@/lib/media/cloudinary/upload";
import { validateImageFile } from "@/lib/media/validation";
import type { MediaContext } from "@/types/media";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_CONTEXTS = new Set<MediaContext>([
  "avatar",
  "resume",
  "portfolio",
  "export",
]);

/** Legacy alias — same secure upload flow as /api/v1/media/upload */
export async function POST(req: NextRequest) {
  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Cloudinary is not configured.", code: "CLOUDINARY_NOT_CONFIGURED" },
      { status: 503 }
    );
  }

  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") ?? formData.get("image");
    const contextRaw = formData.get("context");
    const context: MediaContext =
      typeof contextRaw === "string" && VALID_CONTEXTS.has(contextRaw as MediaContext)
        ? (contextRaw as MediaContext)
        : "avatar";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file." }, { status: 400 });
    }

    const validation = validateImageFile(file, context);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error, code: validation.code }, { status: 400 });
    }

    const media = await uploadImageFile(file, { context, userId: user.email });
    return NextResponse.json({ success: true, media });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST with multipart form data, or POST /api/v1/media/upload.",
    v1: "/api/v1/media/upload",
  });
}
