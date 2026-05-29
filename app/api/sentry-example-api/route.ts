import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { blockInProduction, handleApiError } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

class SentryExampleAPIError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = "SentryExampleAPIError";
  }
}

/** Dev-only route to test Sentry error monitoring. */
export async function GET() {
  try {
    const blocked = blockInProduction();
    if (blocked) return blocked;

    Sentry.logger.info("Sentry example API called");
    throw new SentryExampleAPIError(
      "This error is raised on the backend called by the example page."
    );
  } catch (err) {
    if (err instanceof SentryExampleAPIError) {
      throw err;
    }
    return handleApiError(err, "sentry-example GET", "Example route failed");
  }
}
