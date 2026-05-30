/** True for Next.js App Router control-flow errors — not application bugs. */
export function isNextNavigationError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message;
    if (
      msg === "NEXT_REDIRECT" ||
      msg === "NEXT_NOT_FOUND" ||
      msg.startsWith("NEXT_REDIRECT") ||
      msg.startsWith("NEXT_NOT_FOUND")
    ) {
      return true;
    }
  }

  if (typeof error === "object" && error !== null && "digest" in error) {
    const digest = String((error as { digest?: string }).digest ?? "");
    if (digest.startsWith("NEXT_REDIRECT") || digest.startsWith("NEXT_NOT_FOUND")) {
      return true;
    }
  }

  return false;
}
