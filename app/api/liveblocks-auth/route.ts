import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import { getLiveblocksServer, roomIdForCv } from "@/lib/liveblocks/server";
import { isLiveblocksConfigured } from "@/lib/env";
import { handleApiError, unauthorized } from "@/lib/api-errors";
import { parseJsonBody } from "@/lib/safe-route";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    if (!isLiveblocksConfigured()) {
      return NextResponse.json(
        { error: "Liveblocks not configured", code: "SERVICE_UNAVAILABLE" },
        { status: 503 }
      );
    }

    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return unauthorized();
    }

    const body = await parseJsonBody(req);
    const cvId =
      typeof body.cvId === "string"
        ? body.cvId
        : typeof body.room === "string"
          ? body.room
          : undefined;
    if (!cvId) {
      return NextResponse.json({ error: "cvId required" }, { status: 400 });
    }

    const lb = getLiveblocksServer();
    if (!lb) {
      return NextResponse.json(
        { error: "Liveblocks not configured", code: "SERVICE_UNAVAILABLE" },
        { status: 503 }
      );
    }

    const session = lb.prepareSession(user.email, {
      userInfo: {
        name: user.name ?? user.email.split("@")[0],
        email: user.email,
        avatar: user.image ?? undefined,
      },
    });

    session.allow(roomIdForCv(cvId), session.FULL_ACCESS);
    const { status, body: authBody } = await session.authorize();
    return new Response(authBody, { status });
  } catch (err) {
    return handleApiError(err, "liveblocks-auth POST", "Collaboration auth failed");
  }
}
