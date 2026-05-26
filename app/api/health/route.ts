import { NextResponse } from "next/server";
import { getCache } from "@/lib/enterprise/cache/redis";
import { getJobQueue } from "@/lib/enterprise/queue/job-queue";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, string> = {
    app: "ok",
    timestamp: new Date().toISOString(),
  };

  try {
    const cache = getCache();
    await cache.set("health:ping", "pong", 10);
    const pong = await cache.get<string>("health:ping");
    checks.cache = pong === "pong" ? "ok" : "degraded";
  } catch {
    checks.cache = "unavailable";
  }

  try {
    checks.queue = `ok (${getJobQueue().getPendingCount()} pending)`;
  } catch {
    checks.queue = "unavailable";
  }

  try {
    if (process.env.MONGODB_URI) {
      const { pingDatabase } = await import("@/lib/mongodb");
      const mongo = await pingDatabase();
      checks.mongodb = mongo.ok ? `ok (${mongo.latencyMs}ms)` : "degraded";
    } else {
      checks.mongodb = "not configured";
    }
  } catch {
    checks.mongodb = "unavailable";
  }

  if (process.env.DATABASE_URL?.startsWith("postgresql")) {
    checks.database = "configured";
  } else {
    checks.database = process.env.DATABASE_URL ? "sqlite/dev" : "missing";
  }

  const healthy = checks.cache !== "unavailable" && checks.app === "ok";

  return NextResponse.json(
    { status: healthy ? "ok" : "degraded", checks },
    { status: healthy ? 200 : 503 }
  );
}
