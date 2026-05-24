/**
 * Detect Next.js static build / page-data collection phase.
 * During this phase we must not open DB connections or require runtime secrets.
 */
export function isBuildPhase(): boolean {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.NEXT_PHASE === "phase-export"
  );
}

/** True when code is running on Vercel (build or runtime). */
export function isVercel(): boolean {
  return Boolean(process.env.VERCEL);
}
