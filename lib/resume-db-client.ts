/**
 * Client-side Postgres availability probe — avoids hammering /api/resumes/save when DB is down.
 */

const CACHE_MS = 60_000;

let cached: { ok: boolean; checkedAt: number } | null = null;

export function markResumeDbUnavailable(): void {
  cached = { ok: false, checkedAt: Date.now() };
}

export function markResumeDbAvailable(): void {
  cached = { ok: true, checkedAt: Date.now() };
}

export async function isResumeDbAvailable(force = false): Promise<boolean> {
  if (!force && cached && Date.now() - cached.checkedAt < CACHE_MS) {
    return cached.ok;
  }

  try {
    const res = await fetch("/api/health/db", { credentials: "include" });
    if (!res.ok) {
      cached = { ok: false, checkedAt: Date.now() };
      return false;
    }
    const data = (await res.json()) as { available?: boolean };
    const ok = data.available === true;
    cached = { ok, checkedAt: Date.now() };
    return ok;
  } catch {
    cached = { ok: false, checkedAt: Date.now() };
    return false;
  }
}
