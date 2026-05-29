import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-errors";

type RouteContext = { params?: Record<string, string | string[]> };
type RouteResult = NextResponse | Response;

type RouteHandler = (
  req: NextRequest,
  context?: RouteContext
) => Promise<RouteResult | void>;

/**
 * Wraps App Router handlers so uncaught errors always return JSON (never crash the process).
 */
export function safeRoute(
  label: string,
  handler: RouteHandler,
  fallbackMessage = "Something went wrong"
): RouteHandler {
  return async (req, routeContext) => {
    try {
      const result = await handler(req, routeContext);
      if (result instanceof Response) {
        return result;
      }
      return NextResponse.json(
        { error: fallbackMessage, code: "INTERNAL_ERROR" },
        { status: 500 }
      );
    } catch (err) {
      if (err instanceof Response) {
        return err;
      }
      return handleApiError(err, label, fallbackMessage);
    }
  };
}

export async function parseJsonBody<T extends Record<string, unknown>>(
  req: NextRequest
): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    return {} as T;
  }
}
