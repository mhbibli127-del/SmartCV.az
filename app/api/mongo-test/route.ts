import { NextResponse } from "next/server";
import { connectDB, getMongoConnectionState, pingDatabase } from "@/lib/mongodb";
import { maskMongoUri, requireMongoUri } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const uri = requireMongoUri();
    // eslint-disable-next-line no-console
    console.log("[mongo-test] URI validated:", maskMongoUri(uri));

    await connectDB();
    const ping = await pingDatabase();
    const state = getMongoConnectionState();

    return NextResponse.json({
      ok: true,
      db: state.name ?? uri.split("/").pop()?.split("?")[0] ?? "unknown",
      latencyMs: ping.latencyMs,
      readyState: state.readyState,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Connection failed";
    // eslint-disable-next-line no-console
    console.error("[mongo-test]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
