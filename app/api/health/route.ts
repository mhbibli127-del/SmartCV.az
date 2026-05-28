import { NextResponse } from "next/server";
import { getCache } from "@/lib/enterprise/cache/redis";
import { getJobQueue } from "@/lib/enterprise/queue/job-queue";
import { getDatabaseHealth } from "@/lib/db-health";
import { isMongoConfigured, isPostgresConfigured } from "@/lib/env";
import {
  isMongoCircuitOpen,
  isPrismaCircuitOpen,
} from "@/lib/db-circuit";

export const dynamic = "force-dynamic";

function formatPostgresCheck(
  status: Awaited<ReturnType<typeof getDatabaseHealth>>["postgres"],
  latencyMs?: number
): string {
  if (status === "ok") return latencyMs != null ? `ok (${latencyMs}ms)` : "ok";
  if (status === "circuit_open") return "circuit_open";
  if (status === "misconfigured") return "misconfigured";
  if (status === "not_configured") return "not configured";
  return "error";
}

function formatMongoCheck(
  status: Awaited<ReturnType<typeof getDatabaseHealth>>["mongo"],
  latencyMs?: number
): string {
  if (status === "ok") return latencyMs != null ? `ok (${latencyMs}ms)` : "ok";
  if (status === "circuit_open") return "circuit_open";
  if (status === "not_configured") return "not configured";
  return "error";
}

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

  let dbHealth: Awaited<ReturnType<typeof getDatabaseHealth>> | null = null;

  if (isPostgresConfigured()) {
    if (isPrismaCircuitOpen()) {
      checks.postgres = "circuit_open";
    } else {
      dbHealth ??= await getDatabaseHealth();
      checks.postgres = formatPostgresCheck(
        dbHealth.postgres,
        dbHealth.postgresLatencyMs
      );
    }
  } else {
    checks.postgres = "not configured";
  }

  if (isMongoConfigured()) {
    if (isMongoCircuitOpen()) {
      checks.mongodb = "circuit_open";
    } else {
      dbHealth ??= await getDatabaseHealth();
      checks.mongodb = formatMongoCheck(dbHealth.mongo, dbHealth.mongoLatencyMs);
    }
  } else {
    checks.mongodb = "not configured";
  }

  // Legacy key kept for existing monitors
  checks.database = checks.postgres;

  const coreOk =
    checks.app === "ok" &&
    (checks.postgres === "ok" ||
      checks.postgres === "not configured" ||
      checks.postgres === "circuit_open");

  const healthy = checks.cache !== "unavailable" && coreOk;

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      checks,
      circuits: {
        postgres: isPrismaCircuitOpen(),
        mongo: isMongoCircuitOpen(),
      },
    },
    { status: healthy ? 200 : 503 }
  );
}
