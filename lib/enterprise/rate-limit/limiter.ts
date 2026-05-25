import { getCache } from "@/lib/enterprise/cache/redis";
import type { RateLimitResult } from "@/types/enterprise";

export interface RateLimitConfig {
  key: string;
  limit: number;
  windowSeconds: number;
}

/**
 * Sliding-window rate limiter using Redis INCR + EXPIRE.
 * Falls back to in-memory when Redis is unavailable.
 */
export async function checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  const cache = getCache();
  const bucketKey = `ratelimit:${config.key}`;

  const count = await cache.incr(bucketKey);
  if (count === 1) {
    await cache.expire(bucketKey, config.windowSeconds);
  }

  const resetAt = new Date(Date.now() + config.windowSeconds * 1000);
  const remaining = Math.max(0, config.limit - count);

  return {
    allowed: count <= config.limit,
    remaining,
    resetAt,
  };
}

export async function rateLimitByUser(
  userId: string,
  action: string,
  limit = 60,
  windowSeconds = 60
): Promise<RateLimitResult> {
  return checkRateLimit({
    key: `${action}:${userId}`,
    limit,
    windowSeconds,
  });
}

export async function rateLimitByIp(
  ip: string,
  action: string,
  limit = 30,
  windowSeconds = 60
): Promise<RateLimitResult> {
  return checkRateLimit({
    key: `${action}:ip:${ip}`,
    limit,
    windowSeconds,
  });
}

/** AI-specific: 10 requests per minute per user. */
export async function rateLimitAI(userId: string): Promise<RateLimitResult> {
  return rateLimitByUser(userId, "ai", 10, 60);
}
