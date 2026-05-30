import { NextResponse } from "next/server";
import { checkPostgresHealth } from "@/lib/db-health";
import { isPostgresConfigured } from "@/lib/env";
import { isPrismaCircuitOpen } from "@/lib/db-circuit";

export const dynamic = "force-dynamic";

/** Lightweight Postgres probe — always HTTP 200 (body reports availability). */
export async function GET() {
  if (!isPostgresConfigured()) {
    return NextResponse.json({
      available: false,
      postgres: "not configured",
    });
  }

  if (isPrismaCircuitOpen()) {
    return NextResponse.json({
      available: false,
      postgres: "circuit_open",
    });
  }

  const result = await checkPostgresHealth();
  return NextResponse.json({
    available: result.status === "ok",
    postgres: result.status,
    latencyMs: result.latencyMs,
  });
}
