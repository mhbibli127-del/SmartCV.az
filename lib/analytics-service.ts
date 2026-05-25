import { getDatabase } from "@/lib/mongodb";
import { listUserCVs, getCVById } from "@/lib/cv-service";
import { findSaasUserByEmail } from "@/lib/saas-user";
import { computeAtsScore } from "@/lib/ats-score";
import { hydrateCvData } from "@/lib/cv-hydration";
import type { CVSection } from "@/types/cv-document";

export type DateRangeKey = "7d" | "30d" | "90d" | "1y";

export function parseDateRange(range: string): { start: Date; end: Date; days: number } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  const map: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };
  const days = map[range] ?? 7;
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);
  return { start, end, days };
}

export async function getUserAnalytics(email: string, range: DateRangeKey = "7d") {
  const { start, end, days } = parseDateRange(range);
  const cleanEmail = email.trim().toLowerCase();

  let interactions: {
    action: string;
    page: string;
    timestamp: Date;
    metadata?: Record<string, unknown>;
  }[] = [];

  try {
    const db = await getDatabase();
    interactions = (await db
      .collection("interactions")
      .find({
        userEmail: cleanEmail,
        timestamp: { $gte: start, $lte: end },
      })
      .sort({ timestamp: -1 })
      .limit(200)
      .toArray()) as unknown as typeof interactions;
  } catch {
    /* Mongo optional */
  }

  const cvs = await listUserCVs(cleanEmail).catch(() => []);
  const saasUser = await findSaasUserByEmail(cleanEmail).catch(() => null);

  const pageViews = interactions.filter((i) => i.action === "page_view").length;
  const downloads = interactions.filter(
    (i) => i.action === "template_download" || i.action === "cv_export" || i.action === "cv_created"
  ).length;
  const aiUsage = interactions.filter(
    (i) => i.action === "ai_enhance" || i.action === "ai_generate" || i.action === "ai_optimize"
  ).length;

  const dailyMap = new Map<string, { views: number; downloads: number }>();
  for (let d = 0; d < days; d++) {
    const day = new Date(start);
    day.setDate(day.getDate() + d);
    const key = day.toISOString().slice(0, 10);
    dailyMap.set(key, { views: 0, downloads: 0 });
  }

  for (const item of interactions) {
    const key = new Date(item.timestamp).toISOString().slice(0, 10);
    const bucket = dailyMap.get(key) ?? { views: 0, downloads: 0 };
    if (item.action === "page_view") bucket.views += 1;
    if (
      item.action === "cv_export" ||
      item.action === "template_download" ||
      item.action === "cv_created"
    ) {
      bucket.downloads += 1;
    }
    dailyMap.set(key, bucket);
  }

  const chartData = Array.from(dailyMap.entries()).map(([iso, v]) => ({
    name: new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    views: v.views,
    downloads: v.downloads,
  }));

  const featureUsage = [
    { name: "Builder", value: interactions.filter((i) => i.page?.includes("builder")).length },
    { name: "Generator", value: interactions.filter((i) => i.page?.includes("generator")).length },
    { name: "Examples", value: interactions.filter((i) => i.page?.includes("examples")).length },
    { name: "Editor", value: interactions.filter((i) => i.page?.includes("editor")).length },
    { name: "AI", value: aiUsage },
  ].filter((f) => f.value > 0);

  const recentActivity = interactions.slice(0, 10).map((i) => ({
    action: i.action.replace(/_/g, " "),
    page: i.page,
    time: i.timestamp,
  }));

  const conversionRate =
    pageViews > 0 ? Math.round((downloads / pageViews) * 1000) / 10 : 0;

  return {
    range,
    totalViews: pageViews,
    totalDownloads: downloads,
    totalCVs: cvs.length,
    aiUsage,
    conversionRate,
    plan: saasUser?.plan ?? "free",
    cvUsed: saasUser?.cvUsed ?? cvs.length,
    chartData,
    featureUsage: featureUsage.length ? featureUsage : [],
    recentActivity,
  };
}

export async function getUserStats(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  const cvs = await listUserCVs(cleanEmail).catch(() => []);
  const saasUser = await findSaasUserByEmail(cleanEmail).catch(() => null);

  let interactions = 0;
  try {
    const db = await getDatabase();
    interactions = await db.collection("interactions").countDocuments({ userEmail: cleanEmail });
  } catch {
    /* optional */
  }

  const lastCv = cvs[0];
  const lastEdited = lastCv?.updatedAt
    ? new Date(lastCv.updatedAt).toLocaleString()
    : "Never";

  let atsScore = 0;
  if (lastCv?.id) {
    const full = await getCVById(cleanEmail, lastCv.id).catch(() => null);
    if (full?.content) {
      const raw = full.content as unknown as Record<string, unknown>;
      const hydrated = hydrateCvData({
        sections: (raw.sections as CVSection[] | undefined) ?? [],
        generatorData: raw.generatorData as Record<string, unknown> | undefined,
      });
      atsScore = computeAtsScore({
        sections: hydrated.sections ?? [],
        generatorData: hydrated.generatorData,
      });
    }
  }

  return {
    totalResumes: cvs.length,
    profileViews: interactions,
    atsScore,
    lastEdited,
    plan: saasUser?.plan ?? "free",
    cvUsed: saasUser?.cvUsed ?? cvs.length,
    cvLimit: saasUser?.cvLimit ?? 3,
  };
}
