import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import { rateLimitByIp, rateLimitByUser } from "@/lib/enterprise/rate-limit/limiter";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
  }
}

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export interface GuardOptions {
  requireAuth?: boolean;
  rateLimit?: { action: string; limit?: number; windowSeconds?: number };
  rateLimitIp?: { action: string; limit?: number; windowSeconds?: number };
}

export async function withApiGuard(
  req: NextRequest,
  options: GuardOptions = {}
): Promise<{ user: { email: string } | null; ip: string }> {
  const ip = getClientIp(req);
  const user = await getAuthenticatedUser(req);

  if (options.rateLimitIp) {
    const rl = await rateLimitByIp(
      ip,
      options.rateLimitIp.action,
      options.rateLimitIp.limit ?? 60,
      options.rateLimitIp.windowSeconds ?? 60
    );
    if (!rl.allowed) {
      throw new ApiError("Too many requests.", 429, "RATE_LIMIT");
    }
  }

  if (options.requireAuth && !user?.email) {
    throw new ApiError("Unauthorized", 401, "UNAUTHORIZED");
  }

  if (user?.email && options.rateLimit) {
    const rl = await rateLimitByUser(
      user.email,
      options.rateLimit.action,
      options.rateLimit.limit ?? 30,
      options.rateLimit.windowSeconds ?? 60
    );
    if (!rl.allowed) {
      throw new ApiError("Rate limit exceeded.", 429, "RATE_LIMIT");
    }
  }

  return { user: user?.email ? { email: user.email } : null, ip };
}

export function apiErrorResponse(err: unknown): NextResponse {
  if (err instanceof ApiError) {
    return NextResponse.json(
      { error: err.message, code: err.code },
      { status: err.status }
    );
  }
  console.error("[api]", err);
  return NextResponse.json(
    { error: "Internal server error", code: "INTERNAL" },
    { status: 500 }
  );
}

export function jsonOk<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}
