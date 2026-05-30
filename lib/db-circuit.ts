/**
 * Stops hammering Postgres/Supabase when auth fails or pooler blocks connections.
 * Opens circuit after repeated failures; auto-resets after cooldown.
 */

import { validatePostgresEnv } from "@/lib/database-url";
import { getDatabaseUrl } from "@/lib/env";

const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
const MAX_FAILURES = 2;

let failureCount = 0;
let circuitOpenUntil = 0;

let mongoCircuitOpenUntil = 0;

function isCircuitBreakerMessage(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("ECIRCUITBREAKER") ||
    msg.includes("too many authentication failures") ||
    msg.includes("password authentication failed") ||
    msg.includes("invalid credentials")
  );
}

export function isPrismaCircuitOpen(): boolean {
  if (circuitOpenUntil === 0) return false;
  if (Date.now() >= circuitOpenUntil) {
    circuitOpenUntil = 0;
    failureCount = 0;
    return false;
  }
  return true;
}

export function recordPrismaFailure(err: unknown): void {
  failureCount += 1;
  if (isCircuitBreakerMessage(err) || failureCount >= MAX_FAILURES) {
    circuitOpenUntil = Date.now() + COOLDOWN_MS;
    console.warn(
      `[db-circuit] Prisma paused for ${COOLDOWN_MS / 60000} min — fix DATABASE_URL or wait for Supabase unblock`
    );
  }
}

export function resetPrismaCircuit(): void {
  failureCount = 0;
  circuitOpenUntil = 0;
}

/** MongoDB — optional service; pause retries after first failure in dev. */
export function isMongoCircuitOpen(): boolean {
  if (mongoCircuitOpenUntil === 0) return false;
  if (Date.now() >= mongoCircuitOpenUntil) {
    mongoCircuitOpenUntil = 0;
    return false;
  }
  return true;
}

export function openMongoCircuit(): void {
  mongoCircuitOpenUntil = Date.now() + COOLDOWN_MS;
}

export function recordMongoFailure(_err?: unknown): void {
  openMongoCircuit();
}

export function validatePostgresUrl(url: string | null | undefined): {
  ok: boolean;
  reason?: string;
} {
  const validation = validatePostgresEnv(
    url ?? process.env.DATABASE_URL,
    process.env.DIRECT_URL
  );
  return { ok: validation.ok, reason: validation.reason };
}

export class DatabaseUnavailableError extends Error {
  readonly retryAfterSec = 300;

  constructor(message = "Database temporarily unavailable. Work is saved locally.") {
    super(message);
    this.name = "DatabaseUnavailableError";
  }
}

export function assertDatabaseAvailable(): void {
  if (isPrismaCircuitOpen()) {
    throw new DatabaseUnavailableError();
  }
  const validation = validatePostgresUrl(getDatabaseUrl());
  if (!validation.ok) {
    throw new DatabaseUnavailableError(validation.reason ?? "Database not configured");
  }
}
