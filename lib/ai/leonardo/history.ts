import { getDatabase } from "@/lib/mongodb";
import type { LeonardoHistoryEntry, LeonardoPresetId } from "@/lib/ai/leonardo/types";

const COLLECTION = "ai_generations";

export async function saveGenerationHistory(
  entry: Omit<LeonardoHistoryEntry, "_id" | "createdAt" | "updatedAt">
): Promise<void> {
  try {
    const db = await getDatabase();
    const now = new Date();
    await db.collection(COLLECTION).updateOne(
      { generationId: entry.generationId, userId: entry.userId },
      {
        $set: { ...entry, updatedAt: now },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );
  } catch (err) {
    console.error("[leonardo/history] save failed:", err);
  }
}

export async function updateGenerationHistory(
  userId: string,
  generationId: string,
  update: Partial<Pick<LeonardoHistoryEntry, "status" | "imageUrls" | "enhancedPrompt">>
): Promise<void> {
  try {
    const db = await getDatabase();
    await db.collection(COLLECTION).updateOne(
      { generationId, userId: userId.toLowerCase().trim() },
      { $set: { ...update, updatedAt: new Date() } }
    );
  } catch (err) {
    console.error("[leonardo/history] update failed:", err);
  }
}

export async function listGenerationHistory(
  userId: string,
  limit = 20
): Promise<LeonardoHistoryEntry[]> {
  try {
    const db = await getDatabase();
    const rows = await db
      .collection(COLLECTION)
      .find({ userId: userId.toLowerCase().trim() })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    return rows as unknown as LeonardoHistoryEntry[];
  } catch {
    return [];
  }
}

export async function getGenerationHistoryByPreset(
  userId: string,
  preset: LeonardoPresetId,
  limit = 10
): Promise<LeonardoHistoryEntry[]> {
  try {
    const db = await getDatabase();
    const rows = await db
      .collection(COLLECTION)
      .find({ userId: userId.toLowerCase().trim(), preset })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    return rows as unknown as LeonardoHistoryEntry[];
  } catch {
    return [];
  }
}
