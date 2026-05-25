import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import { listUserCVs } from "@/lib/cv-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cvs = await listUserCVs(auth.email);
    return NextResponse.json({ cvs, total: cvs.length });
  } catch (err) {
    console.error("[cv/list]", err);
    return NextResponse.json({ error: "Failed to load CVs" }, { status: 500 });
  }
}
