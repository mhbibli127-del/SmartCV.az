import { NextResponse } from "next/server";
import { DatabaseUnavailableError } from "@/lib/db-circuit";

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function apiJson<T extends Record<string, unknown>>(
  body: T,
  init?: ResponseInit
): NextResponse {
  return NextResponse.json(body, init);
}

export function unauthorized(message = "Unauthorized") {
  return apiJson({ error: message, code: "UNAUTHORIZED" }, { status: 401 });
}

export function notFound(message = "Not found") {
  return apiJson({ error: message, code: "NOT_FOUND" }, { status: 404 });
}

export function badRequest(message: string, code = "BAD_REQUEST") {
  return apiJson({ error: message, code }, { status: 400 });
}

export function tooManyRequests(retryAfterSec: number) {
  return apiJson(
    { error: "Too many requests. Please try again later.", code: "RATE_LIMITED" },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSec) },
    }
  );
}

/** Hide debug/diagnostic routes in production deployments. */
export function blockInProduction(): NextResponse | null {
  if (isProduction()) {
    return notFound();
  }
  return null;
}

export function handleApiError(
  err: unknown,
  context: string,
  fallbackMessage = "Something went wrong"
): NextResponse {
  if (err instanceof DatabaseUnavailableError) {
    return apiJson(
      { error: err.message, code: "DATABASE_UNAVAILABLE", offline: true },
      {
        status: 503,
        headers: { "Retry-After": String(err.retryAfterSec) },
      }
    );
  }

  console.error(`[${context}]`, err);

  if (isProduction()) {
    return apiJson({ error: fallbackMessage, code: "INTERNAL_ERROR" }, { status: 500 });
  }

  const message = err instanceof Error ? err.message : fallbackMessage;
  return apiJson({ error: message, code: "INTERNAL_ERROR" }, { status: 500 });
}
