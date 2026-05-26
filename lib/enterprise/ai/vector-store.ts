import { createEmbeddingCached, cosineSimilarity, EMBEDDING_DIM } from "@/lib/enterprise/ai/embeddings";
import { queryVectors, upsertVectors, type VectorRecord } from "@/lib/pinecone";
import { isPineconeConfigured } from "@/lib/env";

export interface SemanticSearchResult<T = Record<string, unknown>> {
  id: string;
  score: number;
  metadata?: T;
}

/**
 * Upsert document embeddings into Pinecone (or no-op when unconfigured).
 */
export async function indexDocumentEmbedding(
  id: string,
  text: string,
  metadata?: Record<string, string | number | boolean>
): Promise<void> {
  const embedding = await createEmbeddingCached(text);
  if (embedding.length !== EMBEDDING_DIM) return;

  await upsertVectors([{ id, values: embedding, metadata }]);
}

/**
 * Semantic search — Pinecone when configured, in-memory cosine fallback.
 */
export async function semanticSearch<T extends { id: string; embedding?: number[] }>(
  query: string,
  candidates: T[],
  limit = 10,
  namespace?: string
): Promise<Array<T & { similarity: number; metadata?: Record<string, unknown> }>> {
  const queryEmbedding = await createEmbeddingCached(query);

  if (isPineconeConfigured()) {
    const filter = namespace ? { namespace } : undefined;
    const matches = await queryVectors(queryEmbedding, limit, filter as Record<string, string>);
    if (matches.length > 0) {
      return matches.map((m) => {
        const candidate = candidates.find((c) => c.id === m.id);
        return {
          ...(candidate ?? ({ id: m.id } as T)),
          similarity: m.score,
          metadata: m.metadata,
        };
      });
    }
  }

  return candidates
    .filter((c) => c.embedding && c.embedding.length === EMBEDDING_DIM)
    .map((c) => ({
      ...c,
      similarity: cosineSimilarity(queryEmbedding, c.embedding!),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

/** Batch index for template catalog or CV sections */
export async function batchIndexEmbeddings(records: VectorRecord[]): Promise<number> {
  if (!isPineconeConfigured()) return 0;
  const ok = await upsertVectors(records);
  return ok ? records.length : 0;
}

/** Store AI memory for long-term personalization */
export async function storeAIMemory(
  userId: string,
  memoryKey: string,
  content: string,
  tags?: string[]
): Promise<void> {
  const id = `${userId}:${memoryKey}`.replace(/[^a-zA-Z0-9:_-]/g, "_").slice(0, 512);
  await indexDocumentEmbedding(id, content, {
    userId,
    memoryKey,
    tags: tags?.join(",") ?? "",
    type: "ai_memory",
  });
}

export async function recallAIMemory(
  userId: string,
  query: string,
  limit = 5
): Promise<SemanticSearchResult[]> {
  if (!isPineconeConfigured()) return [];

  const embedding = await createEmbeddingCached(query);
  const matches = await queryVectors(embedding, limit, { userId, type: "ai_memory" });

  return matches.map((m) => ({
    id: m.id,
    score: m.score,
    metadata: m.metadata,
  }));
}
