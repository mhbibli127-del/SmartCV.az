/**
 * Next.js instrumentation hook.
 *
 * Runs once per server process startup. We use it to validate the server
 * environment and print a clear banner so missing/placeholder values are
 * obvious before any request hits a route.
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  // Skip env banner during static build — avoids noisy logs and side effects.
  if (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.NEXT_PHASE === "phase-export"
  ) {
    return;
  }
  const { assertServerEnv } = await import("@/lib/env");
  assertServerEnv();
}
