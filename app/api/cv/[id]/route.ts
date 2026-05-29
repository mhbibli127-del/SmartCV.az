import { NextRequest, NextResponse } from "next/server";
import { parseJsonBody } from "@/lib/safe-route";
import { getAuthenticatedUser } from "@/lib/session";
import {
  getCVById,
  updateCVById,
  deleteCVById,
} from "@/lib/cv-service";
import { syncAndIncrementCvUsed } from "@/lib/cv-limit";

export const dynamic = "force-dynamic";

type RouteParams = { params: { id: string } };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cv = await getCVById(user.email, params.id);
    if (!cv) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    return NextResponse.json({ cv });
  } catch (err) {
    console.error("[cv/id GET]", err);
    return NextResponse.json({ error: "Failed to load CV" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await parseJsonBody(req);
    const cv = await updateCVById(user.email, params.id, {
      title: typeof body.title === "string" ? body.title : undefined,
      templateId:
        typeof body.templateId === "number"
          ? body.templateId
          : typeof body.templateId === "string"
            ? Number(body.templateId)
            : undefined,
      content: (body.content ?? body.cvData) as Parameters<typeof updateCVById>[2]["content"],
      status:
        body.status === "completed" || body.status === "draft"
          ? body.status
          : undefined,
    });

    if (!cv) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, cv });
  } catch (err) {
    console.error("[cv/id PUT]", err);
    return NextResponse.json({ error: "Failed to update CV" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deleted = await deleteCVById(user.email, params.id);
    if (!deleted) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    await syncAndIncrementCvUsed(user.email).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[cv/id DELETE]", err);
    return NextResponse.json({ error: "Failed to delete CV" }, { status: 500 });
  }
}
