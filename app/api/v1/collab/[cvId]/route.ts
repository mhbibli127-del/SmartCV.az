import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import {
  getCollabSession,
  syncCollabElements,
  updateCollabPresence,
} from "@/lib/realtime/collab-session-store";
import type { EditorElement } from "@/types/cv-document";
import type { CollabPresence } from "@/lib/realtime/collab-session-store";
import { handleApiError, unauthorized } from "@/lib/api-errors";
import { parseJsonBody } from "@/lib/safe-route";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { cvId: string } }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return unauthorized();
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
  } catch (err) {
    return handleApiError(err, "collab GET", "Collaboration sync failed");
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { cvId: string } }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return unauthorized();
    }

    const body = await parseJsonBody<{
      action?: "sync" | "presence";
      presence?: CollabPresence;
      elements?: EditorElement[];
      version?: number;
    }>(req);
    const action = body.action;

    if (action === "presence") {
      const presence = body.presence;
      if (!presence) {
        return NextResponse.json({ error: "presence required" }, { status: 400 });
      }
      const session = updateCollabPresence(params.cvId, {
        ...presence,
        userId: user.email,
        name: presence.name ?? user.name ?? user.email.split("@")[0] ?? "User",
      });
      return NextResponse.json({
        ok: true,
        version: session.version,
        presence: session.presence,
      });
    }

    const elements = (body.elements ?? []) as EditorElement[];
    const version = Number(body.version ?? Date.now());
    const session = syncCollabElements(params.cvId, elements, version);

    return NextResponse.json({
      ok: true,
      version: session.version,
      updatedAt: session.updatedAt,
    });
  } catch (err) {
    return handleApiError(err, "collab POST", "Collaboration sync failed");
  }
}
