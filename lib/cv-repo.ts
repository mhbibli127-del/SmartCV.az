/**
 * Thin, type-safe wrapper around Prisma CV operations.
 *
 * The Prisma `CV.data` column is a JSON-serialized string (SQLite has no
 * native JSON type). These helpers parse/stringify at the boundary so
 * callers see plain objects.
 */
import prisma from "@/lib/prisma";

export type CVStatus = "draft" | "completed";

export interface CVPayload {
  sections?: unknown;
  templateName?: string;
  metadata?: unknown;
  generatorData?: unknown;
  [key: string]: unknown;
}

export interface CVRecord {
  id: number;
  userId: number;
  title: string;
  templateId: number;
  status: CVStatus;
  data: CVPayload;
  atsScore: number | null;
  createdAt: Date;
  updatedAt: Date;
}

function parseData(raw: string): CVPayload {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as CVPayload)
      : {};
  } catch {
    return {};
  }
}

function deserialize(cv: {
  id: number;
  userId: number;
  title: string;
  templateId: number;
  status: string;
  data: string;
  atsScore: number | null;
  createdAt: Date;
  updatedAt: Date;
}): CVRecord {
  return {
    id: cv.id,
    userId: cv.userId,
    title: cv.title,
    templateId: cv.templateId,
    status: (cv.status === "completed" ? "completed" : "draft") as CVStatus,
    data: parseData(cv.data),
    atsScore: cv.atsScore,
    createdAt: cv.createdAt,
    updatedAt: cv.updatedAt,
  };
}

export async function listCVsByEmail(email: string): Promise<CVRecord[]> {
  const cleanEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: cleanEmail },
    select: { id: true },
  });
  if (!user) return [];

  const cvs = await prisma.cV.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });
  return cvs.map(deserialize);
}

export async function countCVsByEmail(email: string): Promise<number> {
  const cleanEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: cleanEmail },
    select: { id: true },
  });
  if (!user) return 0;
  return prisma.cV.count({ where: { userId: user.id } });
}

export interface CreateCVInput {
  email: string;
  title?: string;
  templateId?: number;
  status?: CVStatus;
  data?: CVPayload;
  atsScore?: number | null;
}

/**
 * Insert a new CV row. Throws if the user does not exist.
 * Caller is responsible for plan-limit checks (see `lib/plan-limits`).
 */
export async function createCV(input: CreateCVInput): Promise<CVRecord> {
  const cleanEmail = input.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: cleanEmail },
    select: { id: true },
  });
  if (!user) throw new Error(`User not found for email ${cleanEmail}`);

  const created = await prisma.cV.create({
    data: {
      userId: user.id,
      title: input.title ?? "Untitled CV",
      templateId: input.templateId ?? 1,
      status: input.status ?? "draft",
      data: JSON.stringify(input.data ?? {}),
      atsScore: input.atsScore ?? null,
    },
  });
  return deserialize(created);
}

export interface UpdateCVInput {
  id: number;
  title?: string;
  templateId?: number;
  status?: CVStatus;
  data?: CVPayload;
  atsScore?: number | null;
}

export async function updateCV(input: UpdateCVInput): Promise<CVRecord> {
  const updated = await prisma.cV.update({
    where: { id: input.id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.templateId !== undefined
        ? { templateId: input.templateId }
        : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.data !== undefined ? { data: JSON.stringify(input.data) } : {}),
      ...(input.atsScore !== undefined ? { atsScore: input.atsScore } : {}),
    },
  });
  return deserialize(updated);
}

export async function deleteCV(id: number): Promise<void> {
  await prisma.cV.delete({ where: { id } });
}
