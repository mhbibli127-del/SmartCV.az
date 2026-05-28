import { NextResponse } from "next/server";
import { connectDB, getMongoConnectionState, pingDatabase } from "@/lib/mongodb";
import { maskMongoUri, requireMongoUri } from "@/lib/env";
import { blockInProduction, handleApiError } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

export async function GET() {
  const blocked = blockInProduction();
  if (blocked) return blocked;

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
    return handleApiError(err, "mongo-test", "MongoDB connection failed");
  }
}
