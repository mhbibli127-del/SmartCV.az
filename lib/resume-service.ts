import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import {
  assertDatabaseAvailable,
  DatabaseUnavailableError,
  recordPrismaFailure,
} from "@/lib/db-circuit";
import { withPostgres } from "@/lib/db-health";
import {
  deleteResumeAssets,
  savePublishedResumeAssets,
  saveResumePdf,
  saveResumeThumbnail,
} from "@/lib/resume-assets";
import { getDistinctTemplate } from "@/lib/cv-editor/template-definitions";
import type {
  PublishedResumeItem,
  ResumeContent,
  ResumeListItem,
  ResumeRecord,
  SaveResumeRequest,
} from "@/types/resume";
import { estimateAtsScore } from "@/lib/resume-ats";
import {
  sanitizeResumeContentForPublish,
  sanitizeResumeTitle,
} from "@/lib/resume-sanitize";

async function resolveUserId(email: string): Promise<number> {
  assertDatabaseAvailable();
  const cleanEmail = email.trim().toLowerCase();
  try {
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: cleanEmail.split("@")[0],
        },
        select: { id: true },
      });
    }

    return user.id;
  } catch (err) {
    recordPrismaFailure(err);
    throw new DatabaseUnavailableError();
  }
}

function toRecord(row: {
  id: string;
  userId: number;
  title: string;
  templateId: string;
  templateName: string | null;
  thumbnail: string;
  pdfUrl: string;
  content: Prisma.JsonValue;
  atsScore: number | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}): ResumeRecord {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    templateId: row.templateId,
    templateName: row.templateName,
    thumbnail: row.thumbnail,
    pdfUrl: row.pdfUrl,
    content: (row.content ?? {}) as ResumeContent,
    atsScore: row.atsScore,
    isPublished: row.isPublished,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toListItem(row: {
  id: string;
  title: string;
  templateId: string;
  templateName: string | null;
  thumbnail: string;
  pdfUrl: string;
  atsScore: number | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}): ResumeListItem {
  return {
    id: row.id,
    title: row.title,
    templateId: row.templateId,
    templateName: row.templateName,
    thumbnail: row.thumbnail,
    pdfUrl: row.pdfUrl,
    atsScore: row.atsScore,
    isPublished: row.isPublished,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function templateCategory(templateId: string): string | null {
  const def = getDistinctTemplate(templateId);
  if (!def) return null;
  if (def.atsOptimized) return "ATS";
  if (def.slug.includes("minimal") || def.name.toLowerCase().includes("minimal")) {
    return "Minimal";
  }
  return def.category;
}

function matchesGalleryFilter(templateId: string, filter: string): boolean {
  if (filter === "All") return true;
  const def = getDistinctTemplate(templateId);
  if (!def) return false;
  if (filter === "ATS") return def.atsOptimized;
  if (filter === "Minimal") {
    return def.slug.includes("minimal") || def.name.toLowerCase().includes("minimal");
  }
  return def.category === filter;
}

export async function listUserResumes(email: string): Promise<ResumeListItem[]> {
  return withPostgres(async () => {
    const userId = await resolveUserId(email);

    const rows = await prisma.resume.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        templateId: true,
        templateName: true,
        thumbnail: true,
        pdfUrl: true,
        atsScore: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return rows.map(toListItem);
  });
}

export async function listPublishedResumes(options: {
  q?: string;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<{
  resumes: PublishedResumeItem[];
  total: number;
  page: number;
  totalPages: number;
}> {
  return withPostgres(async () => {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(48, Math.max(1, options.limit ?? 24));
    const category = options.category ?? "All";
    const q = options.q?.trim().toLowerCase() ?? "";

    const rows = await prisma.resume.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      templateId: true,
      templateName: true,
      thumbnail: true,
      pdfUrl: true,
      createdAt: true,
    },
  });

  let filtered = rows.filter((row) => matchesGalleryFilter(row.templateId, category));

  if (q) {
    filtered = filtered.filter((row) => {
      const name = row.templateName?.toLowerCase() ?? "";
      const title = row.title.toLowerCase();
      const cat = templateCategory(row.templateId)?.toLowerCase() ?? "";
      return title.includes(q) || name.includes(q) || cat.includes(q);
    });
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const slice = filtered.slice(start, start + limit);

  return {
    resumes: slice.map((row) => ({
      id: row.id,
      title: row.title,
      templateId: row.templateId,
      templateName: row.templateName,
      templateCategory: templateCategory(row.templateId),
      thumbnail: row.thumbnail,
      pdfUrl: row.pdfUrl,
      createdAt: row.createdAt.toISOString(),
    })),
    total,
    page,
    totalPages,
  };
  });
}

export async function getPublishedResumeById(
  id: string
): Promise<PublishedResumeItem & { content: ResumeContent } | null> {
  return withPostgres(async () => {
    const row = await prisma.resume.findFirst({
      where: { id, isPublished: true },
    });
    if (!row) return null;

    return {
      id: row.id,
      title: row.title,
      templateId: row.templateId,
      templateName: row.templateName,
      templateCategory: templateCategory(row.templateId),
      thumbnail: row.thumbnail,
      pdfUrl: row.pdfUrl,
      createdAt: row.createdAt.toISOString(),
      content: (row.content ?? {}) as ResumeContent,
    };
  });
}

export async function getResumeById(
  email: string,
  id: string
): Promise<ResumeRecord | null> {
  return withPostgres(async () => {
    const userId = await resolveUserId(email);

    const row = await prisma.resume.findFirst({
      where: { id, userId },
    });
    return row ? toRecord(row) : null;
  });
}

export async function saveResume(
  email: string,
  payload: SaveResumeRequest
): Promise<ResumeRecord> {
  return withPostgres(async () => {
    const userId = await resolveUserId(email);

    const atsScore = payload.atsScore ?? estimateAtsScore(payload.content);
  let content = payload.content;
  if (payload.publish) {
    content = sanitizeResumeContentForPublish(payload.content);
  }
  const contentJson = content as Prisma.InputJsonValue;
  const title = payload.publish
    ? sanitizeResumeTitle(payload.title)
    : payload.title;

  let thumbnail = "";
  let pdfUrl = "";

  if (payload.resumeId) {
    const existing = await prisma.resume.findFirst({
      where: { id: payload.resumeId, userId },
    });
    if (!existing) throw new Error("Resume not found");

    if (payload.thumbnailDataUrl && payload.pdfBase64) {
      const assets = await savePublishedResumeAssets(
        payload.thumbnailDataUrl,
        payload.pdfBase64
      );
      thumbnail = assets.thumbnailUrl;
      pdfUrl = assets.pdfUrl;
    } else if (payload.thumbnailDataUrl) {
      thumbnail = await saveResumeThumbnail(payload.resumeId, payload.thumbnailDataUrl);
      pdfUrl = existing.pdfUrl;
    } else if (payload.pdfBase64) {
      pdfUrl = await saveResumePdf(payload.resumeId, payload.pdfBase64);
      thumbnail = existing.thumbnail;
    } else {
      thumbnail = existing.thumbnail;
      pdfUrl = existing.pdfUrl;
    }

    const updated = await prisma.resume.update({
      where: { id: payload.resumeId },
      data: {
        title,
        templateId: payload.templateId,
        templateName: payload.templateName ?? existing.templateName,
        content: contentJson,
        atsScore,
        thumbnail,
        pdfUrl,
        ...(payload.publish ? { isPublished: true } : {}),
      },
    });
    return toRecord(updated);
  }

  let assetsOnCreate: { thumbnailUrl: string; pdfUrl: string } | null = null;
  if (payload.thumbnailDataUrl && payload.pdfBase64) {
    assetsOnCreate = await savePublishedResumeAssets(
      payload.thumbnailDataUrl,
      payload.pdfBase64
    );
  }

  const created = await prisma.resume.create({
    data: {
      userId,
      title,
      templateId: payload.templateId,
      templateName: payload.templateName ?? null,
      content: contentJson,
      atsScore,
      thumbnail: assetsOnCreate?.thumbnailUrl ?? "",
      pdfUrl: assetsOnCreate?.pdfUrl ?? "",
      isPublished: Boolean(payload.publish),
    },
  });

  if (!assetsOnCreate && payload.thumbnailDataUrl) {
    thumbnail = await saveResumeThumbnail(created.id, payload.thumbnailDataUrl);
    const updated = await prisma.resume.update({
      where: { id: created.id },
      data: { thumbnail },
    });
    return toRecord(updated);
  }

  return toRecord(created);
  });
}

/** Export flow: save assets, sanitize content, mark published. */
export async function publishResumeExport(
  email: string,
  payload: SaveResumeRequest
): Promise<ResumeRecord> {
  if (!payload.thumbnailDataUrl || !payload.pdfBase64) {
    throw new Error("PDF and thumbnail are required to publish");
  }
  return saveResume(email, { ...payload, publish: true });
}

export async function duplicateResume(
  email: string,
  id: string
): Promise<ResumeRecord | null> {
  return withPostgres(async () => {
    const source = await getResumeById(email, id);
    if (!source) return null;

    const userId = await resolveUserId(email);

    const copy = await prisma.resume.create({
      data: {
        userId,
        title: `${source.title.replace(/\s*\(Copy\)$/i, "")} (Copy)`,
        templateId: source.templateId,
        templateName: source.templateName,
        content: source.content as Prisma.InputJsonValue,
        atsScore: source.atsScore,
        thumbnail: source.thumbnail,
        pdfUrl: source.pdfUrl,
        isPublished: false,
      },
    });

    return toRecord(copy);
  });
}

export async function deleteResume(email: string, id: string): Promise<boolean> {
  return withPostgres(async () => {
    const userId = await resolveUserId(email);

    const existing = await prisma.resume.findFirst({ where: { id, userId } });
    if (!existing) return false;

    await prisma.resume.delete({ where: { id } });
    await deleteResumeAssets(id).catch(() => {});
    return true;
  });
}

export async function publishResume(
  email: string,
  id: string
): Promise<ResumeRecord | null> {
  return withPostgres(async () => {
    const userId = await resolveUserId(email);

    const existing = await prisma.resume.findFirst({ where: { id, userId } });
    if (!existing) return null;

    const sanitized = sanitizeResumeContentForPublish(
      existing.content as ResumeContent
    );

    const updated = await prisma.resume.update({
      where: { id },
      data: {
        isPublished: true,
        title: sanitizeResumeTitle(existing.title),
        content: sanitized as Prisma.InputJsonValue,
      },
    });
    return toRecord(updated);
  });
}

export const GALLERY_FILTER_CATEGORIES = [
  "All",
  "Modern",
  "ATS",
  "Creative",
  "Executive",
  "Minimal",
] as const;
