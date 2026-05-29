import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import { createCV, listUserCVs } from "@/lib/cv-service";
import { assertCanCreateCV, syncAndIncrementCvUsed } from "@/lib/cv-limit";
import { defaultContent } from "@/lib/cv-normalizer";
import { upsertSaasUserOnAuth } from "@/lib/saas-user";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cvs = await listUserCVs(user.email);
    return NextResponse.json({ cvs, total: cvs.length });
  } catch (err) {
    console.error("[cv GET]", err);
    return NextResponse.json({ error: "Failed to list CVs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await upsertSaasUserOnAuth({ email: user.email, name: user.name });

    await assertCanCreateCV(user.email);

    const body = await req.json().catch(() => ({}));
    const cv = await createCV(user.email, {
      title: body.title,
      templateId: body.templateId,
      content: body.content ?? body.cvData ?? defaultContent(),
      status: body.status ?? "draft",
    });

    await syncAndIncrementCvUsed(user.email).catch(() => {});

    return NextResponse.json({ success: true, cv, cvId: cv.id });
  } catch (err) {
    console.error("[cv POST]", err);
    return NextResponse.json({ error: "Failed to create CV" }, { status: 500 });
  }
}
