import mongoose from "mongoose";
import Cv from "@/models/Cv";
import type { CVContent, CVDocument, CVListItem } from "@/types/cv-document";
import { defaultContent, titleFromContent } from "@/lib/cv-normalizer";
import { connectMongoose } from "@/lib/mongoose-connect";

function toDocument(doc: InstanceType<typeof Cv>): CVDocument {
  const raw = doc.toObject();
  const content = (raw.content ?? {}) as CVContent;
  return {
    id: String(raw._id),
    userId: raw.userId,
    userEmail: raw.userEmail,
    title: raw.title,
    templateId: raw.templateId,
    content,
    status: raw.status,
    atsScore: raw.atsScore,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

async function ensureDb() {
  await connectMongoose();
}

export async function listUserCVs(email: string): Promise<CVListItem[]> {
  await ensureDb();
  const userId = email.trim().toLowerCase();
  const docs = await Cv.find({ userId }).sort({ updatedAt: -1 }).limit(100).lean();
  return docs.map((d) => ({
    id: String(d._id),
    title: d.title || titleFromContent((d.content ?? {}) as CVContent),
    status: d.status ?? "draft",
    updatedAt: d.updatedAt?.toISOString?.() ?? new Date().toISOString(),
    mode: ((d.content as CVContent)?.mode ?? "form") as "form" | "visual",
  }));
}

export async function getCVById(email: string, id: string): Promise<CVDocument | null> {
  await ensureDb();
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const userId = email.trim().toLowerCase();
  const doc = await Cv.findOne({ _id: id, userId });
  return doc ? toDocument(doc) : null;
}

export async function getLatestDraft(email: string): Promise<CVDocument | null> {
  await ensureDb();
  const userId = email.trim().toLowerCase();
  const doc = await Cv.findOne({ userId, status: "draft" }).sort({ updatedAt: -1 });
  return doc ? toDocument(doc) : null;
}

export async function createCV(
  email: string,
  payload: {
    title?: string;
    templateId?: number;
    content?: CVContent;
    status?: "draft" | "completed";
  }
): Promise<CVDocument> {
  await ensureDb();
  const userId = email.trim().toLowerCase();
  const content = payload.content ?? defaultContent();
  const doc = await Cv.create({
    userId,
    userEmail: userId,
    title: payload.title ?? titleFromContent(content),
    templateId: payload.templateId ?? 1,
    content,
    status: payload.status ?? "draft",
  });
  return toDocument(doc);
}

export async function updateCVById(
  email: string,
  id: string,
  payload: {
    title?: string;
    templateId?: number;
    content?: CVContent;
    status?: "draft" | "completed";
  }
): Promise<CVDocument | null> {
  await ensureDb();
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const userId = email.trim().toLowerCase();
  const updates: Record<string, unknown> = {};
  if (payload.title) updates.title = payload.title;
  if (payload.templateId !== undefined) updates.templateId = payload.templateId;
  if (payload.content) {
    updates.content = payload.content;
    if (!payload.title) updates.title = titleFromContent(payload.content);
  }
  if (payload.status) updates.status = payload.status;

  const doc = await Cv.findOneAndUpdate(
    { _id: id, userId },
    { $set: updates },
    { new: true }
  );
  return doc ? toDocument(doc) : null;
}

export async function deleteCVById(email: string, id: string): Promise<boolean> {
  await ensureDb();
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  const userId = email.trim().toLowerCase();
  const result = await Cv.deleteOne({ _id: id, userId });
  return result.deletedCount > 0;
}

export async function countUserCVsMongo(email: string): Promise<number> {
  await ensureDb();
  const userId = email.trim().toLowerCase();
  return Cv.countDocuments({ userId });
}
