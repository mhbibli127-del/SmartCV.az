/** Shared room ID helper (client-safe duplicate of server helper) */
export function roomIdForCv(cvId: string): string {
  return `cv:${cvId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128)}`;
}
