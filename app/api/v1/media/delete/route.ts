import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import { isCloudinaryConfigured } from "@/lib/env";
import {
  assertUserOwnsAsset,
  deleteCloudinaryAsset,
} from "@/lib/media/cloudinary/delete";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * DELETE /api/v1/media/delete
 * Body: { publicId: string }
 */
export async function DELETE(req: NextRequest) {
  try {
    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        { error: "Media service not configured.", code: "CLOUDINARY_NOT_CONFIGURED" },
        { status: 503 }
      );
    }

    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const publicId =
      typeof body?.publicId === "string" ? body.publicId.trim() : "";

    if (!publicId) {
      return NextResponse.json(
        { error: "publicId is required.", code: "MISSING_PUBLIC_ID" },
        { status: 400 }
      );
    }

    if (!assertUserOwnsAsset(publicId, user.email)) {
      return NextResponse.json(
        { error: "You can only delete your own media.", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    const result = await deleteCloudinaryAsset(publicId);
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("[media/delete]", err);
    return NextResponse.json(
      { error: "Delete failed.", code: "DELETE_FAILED" },
      { status: 500 }
    );
  }
}
