import { cacheSet, getCache } from "@/lib/enterprise/cache/redis";
import type { LeonardoGenerationResult } from "@/lib/ai/leonardo/types";

const CACHE_TTL = 3600;

export function cacheKeyForGeneration(generationId: string): string {
  return `leonardo:gen:${generationId}`;
}

export async function cacheGenerationResult(
  result: LeonardoGenerationResult
): Promise<void> {
  await cacheSet(cacheKeyForGeneration(result.generationId), result, CACHE_TTL);
}

export async function getCachedGeneration(
  generationId: string
): Promise<LeonardoGenerationResult | null> {
  return getCache().get<LeonardoGenerationResult>(cacheKeyForGeneration(generationId));
}

export async function invalidateGenerationCache(generationId: string): Promise<void> {
  const { cacheDelete } = await import("@/lib/enterprise/cache/redis");
  await cacheDelete(cacheKeyForGeneration(generationId));
}
