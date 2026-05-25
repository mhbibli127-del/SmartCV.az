/**
 * Redis cache with in-memory fallback for local development.
 * Production: set REDIS_URL (Upstash compatible).
 */

export interface CacheClient {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  incr(key: string): Promise<number>;
  expire(key: string, ttlSeconds: number): Promise<void>;
}

class MemoryCache implements CacheClient {
  private store = new Map<string, { value: string; expiresAt?: number }>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    try {
      return JSON.parse(entry.value) as T;
    } catch {
      return entry.value as unknown as T;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    this.store.set(key, {
      value: JSON.stringify(value),
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
    });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async incr(key: string): Promise<number> {
    const current = (await this.get<number>(key)) ?? 0;
    const next = current + 1;
    await this.set(key, next);
    return next;
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    const entry = this.store.get(key);
    if (entry) {
      entry.expiresAt = Date.now() + ttlSeconds * 1000;
    }
  }
}

/** Minimal Redis client using fetch (Upstash REST) or native URL. */
class RedisCache implements CacheClient {
  private url: string;
  private token: string;

  constructor(url: string, token: string) {
    this.url = url.replace(/\/$/, "");
    this.token = token;
  }

  private async command(args: (string | number)[]): Promise<unknown> {
    const res = await fetch(`${this.url}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
    });
    if (!res.ok) throw new Error(`Redis error: ${res.status}`);
    const data = (await res.json()) as { result: unknown };
    return data.result;
  }

  async get<T>(key: string): Promise<T | null> {
    const result = await this.command(["GET", key]);
    if (result === null || result === undefined) return null;
    try {
      return JSON.parse(String(result)) as T;
    } catch {
      return String(result) as unknown as T;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await this.command(["SET", key, serialized, "EX", ttlSeconds]);
    } else {
      await this.command(["SET", key, serialized]);
    }
  }

  async del(key: string): Promise<void> {
    await this.command(["DEL", key]);
  }

  async incr(key: string): Promise<number> {
    return Number(await this.command(["INCR", key]));
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.command(["EXPIRE", key, ttlSeconds]);
  }
}

let cached: CacheClient | null = null;

export function getCache(): CacheClient {
  if (cached) return cached;

  const restUrl = process.env.UPSTASH_REDIS_REST_URL;
  const restToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (restUrl && restToken) {
    cached = new RedisCache(restUrl, restToken);
    return cached;
  }

  cached = new MemoryCache();
  return cached;
}

export async function cacheGetOrSet<T>(
  key: string,
  ttlSeconds: number,
  factory: () => Promise<T>
): Promise<T> {
  const cache = getCache();
  const hit = await cache.get<T>(key);
  if (hit !== null) return hit;
  const value = await factory();
  await cache.set(key, value, ttlSeconds);
  return value;
}
