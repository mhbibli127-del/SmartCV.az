import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import {
  getCollabSession,
  syncCollabElements,
  updateCollabPresence,
} from "@/lib/realtime/collab-session-store";
import type { EditorElement } from "@/types/cv-document";
import type { CollabPresence } from "@/lib/realtime/collab-session-store";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { cvId: string } }
) {
  const user = await getAuthenticatedUser(req);
  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = Number(req.nextUrl.searchParams.get("since") ?? 0);
  const session = getCollabSession(params.cvId);

  if (session.version <= since) {
    return NextResponse.json({
      cvId: params.cvId,
      version: session.version,
      unchanged: true,
      presence: session.presence,
    });
  }

  return NextResponse.json({
    cvId: params.cvId,
    elements: session.elements,
    version: session.version,
    presence: session.presence,
    updatedAt: session.updatedAt,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { cvId: string } }
) {
  const user = await getAuthenticatedUser(req);
  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const action = body.action as "sync" | "presence";

  if (action === "presence") {
    const presence = body.presence as CollabPresence;
    const session = updateCollabPresence(params.cvId, {
      ...presence,
      userId: user.email,
      name: presence.name ?? user.name ?? user.email.split("@")[0] ?? "User",
    });
    return NextResponse.json({ ok: true, version: session.version, presence: session.presence });
  }

  const elements = (body.elements ?? []) as EditorElement[];
  const version = Number(body.version ?? Date.now());
  const session = syncCollabElements(params.cvId, elements, version);

  return NextResponse.json({
    ok: true,
    version: session.version,
    updatedAt: session.updatedAt,
  });
}
