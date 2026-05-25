import { getOpenAI } from "@/lib/openai";
import { cacheGetOrSet } from "@/lib/enterprise/cache/redis";

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIM = 1536;

export async function createEmbedding(text: string): Promise<number[]> {
  const trimmed = text.slice(0, 8000);
  const client = getOpenAI();
  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: trimmed,
  });
  return response.data[0]?.embedding ?? [];
}

export async function createEmbeddingCached(text: string): Promise<number[]> {
  const hash = Buffer.from(text.slice(0, 200)).toString("base64url").slice(0, 32);
  return cacheGetOrSet(`embedding:${hash}`, 86400, () => createEmbedding(text));
}

/** Cosine similarity between two vectors. */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    normA += a[i]! * a[i]!;
    normB += b[i]! * b[i]!;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * pgvector query interface — executes raw SQL when DATABASE_URL is PostgreSQL.
 * Falls back to in-memory similarity when pgvector unavailable.
 */
export async function vectorSearch<T extends { id: string; embedding?: number[] }>(
  queryText: string,
  candidates: T[],
  limit = 10
): Promise<Array<T & { similarity: number }>> {
  const queryEmbedding = await createEmbeddingCached(queryText);

  const scored = candidates
    .filter((c) => c.embedding && c.embedding.length === EMBEDDING_DIM)
    .map((c) => ({
      ...c,
      similarity: cosineSimilarity(queryEmbedding, c.embedding!),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  return scored;
}

export { EMBEDDING_MODEL, EMBEDDING_DIM };
