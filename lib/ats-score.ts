import type { CVSection } from "@/types/cv-document";
import type { EditorElement } from "@/types/cv-document";
import { defaultContent } from "@/lib/cv-normalizer";

/** Heuristic ATS readiness score (0–100) from CV sections or flat data. */
export function computeAtsScore(input: {
  sections?: CVSection[];
  generatorData?: Record<string, unknown>;
}): number {
  let score = 0;
  const sections = input.sections ?? [];
  const gen = input.generatorData;

  const personal = sections.find((s) => s.type === "personal");
  const p = (personal?.content ?? {}) as Record<string, string>;
  const name = p.name || String(gen?.fullName ?? gen?.name ?? "");
  const email = p.email || String(gen?.email ?? "");
  const title = p.title || String(gen?.title ?? "");

  if (name.length > 2) score += 10;
  if (email.includes("@")) score += 10;
  if (title.length > 2) score += 10;

  const summary =
    sections.find((s) => s.type === "summary")?.content ??
    gen?.summary;
  if (typeof summary === "string" && summary.length > 80) score += 15;

  const experience =
    (sections.find((s) => s.type === "experience")?.content as unknown[]) ??
    (Array.isArray(gen?.experience) ? gen.experience : []);
  if (experience.length > 0) score += 15;
  if (experience.length >= 2) score += 5;

  const hasMetrics = JSON.stringify(experience).match(/\d+%|\$\d|#\d|\d+\+/);
  if (hasMetrics) score += 10;

  const skills =
    sections.find((s) => s.type === "skills")?.content ??
    gen?.skills;
  const skillCount = Array.isArray(skills)
    ? skills.length
    : typeof skills === "string"
      ? skills.split(",").filter(Boolean).length
      : 0;
  if (skillCount >= 5) score += 10;
  if (skillCount >= 10) score += 5;

  const education =
    (sections.find((s) => s.type === "education")?.content as unknown[]) ??
    (Array.isArray(gen?.education) ? gen.education : []);
  if (education.length > 0) score += 10;

  return Math.min(100, score);
}
