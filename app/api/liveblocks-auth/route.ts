import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import { getLiveblocksServer, roomIdForCv } from "@/lib/liveblocks/server";
import { isLiveblocksConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!isLiveblocksConfigured()) {
    return new Response(JSON.stringify({ error: "Liveblocks not configured" }), {
      status: 503,
    });
  }

  const user = await getAuthenticatedUser(req);
  if (!user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const cvId = typeof body.cvId === "string" ? body.cvId : body.room;
  if (!cvId) {
    return new Response(JSON.stringify({ error: "cvId required" }), { status: 400 });
  }

  const lb = getLiveblocksServer()!;
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
}
