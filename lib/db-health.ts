/**
 * Lightweight database health + safe query helpers.
 * Keeps connection attempts minimal when services are down or misconfigured.
 */

import prisma from "@/lib/prisma";
import {
  DatabaseUnavailableError,
  assertDatabaseAvailable,
  isMongoCircuitOpen,
  isPrismaCircuitOpen,
  recordPrismaFailure,
  resetPrismaCircuit,
  validatePostgresUrl,
} from "@/lib/db-circuit";
import { getDatabaseUrl, isMongoConfigured, isMongoEnabled } from "@/lib/env";

export type DbHealthStatus = {
  postgres: "ok" | "circuit_open" | "misconfigured" | "error" | "not_configured";
  mongo: "ok" | "circuit_open" | "not_configured" | "error";
  postgresLatencyMs?: number;
  mongoLatencyMs?: number;
};

export async function checkPostgresHealth(): Promise<{
  status: DbHealthStatus["postgres"];
  latencyMs?: number;
  error?: string;
}> {
  if (isPrismaCircuitOpen()) {
    return { status: "circuit_open" };
  }

  const validation = validatePostgresUrl(getDatabaseUrl());
  if (!validation.ok) {
    return { status: "misconfigured", error: validation.reason };
  }

  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    resetPrismaCircuit();
    return { status: "ok", latencyMs: Date.now() - start };
  } catch (err) {
    recordPrismaFailure(err);
    const message = err instanceof Error ? err.message : String(err);
    return { status: "error", error: message };
  }
}

export async function checkMongoHealth(): Promise<{
  status: DbHealthStatus["mongo"];
  latencyMs?: number;
  error?: string;
}> {
  if (!isMongoEnabled() || !isMongoConfigured()) {
    return { status: "not_configured" };
  }
  if (isMongoCircuitOpen()) {
    return { status: "circuit_open" };
  }

  const start = Date.now();
  try {
    const { pingDatabase } = await import("@/lib/mongodb");
    const result = await pingDatabase();
    return result.ok
      ? { status: "ok", latencyMs: Date.now() - start }
      : { status: "error", error: "ping failed" };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { status: "error", error: message };
  }
}

export async function getDatabaseHealth(): Promise<DbHealthStatus> {
  const [pg, mongo] = await Promise.all([checkPostgresHealth(), checkMongoHealth()]);
  return {
    postgres: pg.status,
    mongo: mongo.status,
    postgresLatencyMs: pg.latencyMs,
    mongoLatencyMs: mongo.latencyMs,
  };
}

/** Run a Prisma operation with circuit breaker + unified unavailable error. */
export async function withPostgres<T>(fn: () => Promise<T>): Promise<T> {
  assertDatabaseAvailable();
  try {
    return await fn();
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) throw err;
    recordPrismaFailure(err);
    throw new DatabaseUnavailableError();
  }
}
