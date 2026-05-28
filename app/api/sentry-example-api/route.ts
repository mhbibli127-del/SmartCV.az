import * as Sentry from "@sentry/nextjs";
import { blockInProduction } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

class SentryExampleAPIError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = "SentryExampleAPIError";
  }
}

/** Dev-only route to test Sentry error monitoring. */
export function GET() {
  const blocked = blockInProduction();
  if (blocked) return blocked;

  Sentry.logger.info("Sentry example API called");
  throw new SentryExampleAPIError(
    "This error is raised on the backend called by the example page."
  );
}
