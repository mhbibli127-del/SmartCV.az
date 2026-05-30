import { Pinecone } from "@pinecone-database/pinecone";
import { getPineconeApiKey, getPineconeIndex, isPineconeConfigured } from "@/lib/env";
const EMBEDDING_DIM = 1536;

let client: Pinecone | null = null;

export function getPineconeClient(): Pinecone | null {
  if (!isPineconeConfigured()) return null;
  if (!client) {
    client = new Pinecone({ apiKey: getPineconeApiKey()! });
  }
  return client;
}

export function getPineconeIndexClient() {
  const pc = getPineconeClient();
  if (!pc) return null;
  const indexName = getPineconeIndex();
  if (!indexName) return null;
  return pc.index(indexName);
}

export interface VectorRecord {
  id: string;
  values: number[];
  metadata?: Record<string, string | number | boolean>;
}

export async function upsertVectors(records: VectorRecord[]): Promise<boolean> {
  const index = getPineconeIndexClient();
  if (!index || records.length === 0) return false;

  const valid = records.filter((r) => r.values.length === EMBEDDING_DIM);
  if (valid.length === 0) return false;

  await index.upsert({
    records: valid.map((r) => ({
      id: r.id,
      values: r.values,
      metadata: r.metadata,
    })),
  });
  return true;
}

export async function queryVectors(
  vector: number[],
  topK = 10,
  filter?: Record<string, string | number | boolean>
): Promise<Array<{ id: string; score: number; metadata?: Record<string, unknown> }>> {
  const index = getPineconeIndexClient();
  if (!index || vector.length !== EMBEDDING_DIM) return [];

  const result = await index.query({
    vector,
    topK,
    includeMetadata: true,
    filter,
  });

  return (result.matches ?? []).map((m) => ({
    id: m.id,
    score: m.score ?? 0,
    metadata: m.metadata as Record<string, unknown> | undefined,
  }));
}

export async function deleteVectors(ids: string[]): Promise<void> {
  const index = getPineconeIndexClient();
  if (!index || ids.length === 0) return;
  await index.deleteMany(ids);
}

export { isPineconeConfigured };
