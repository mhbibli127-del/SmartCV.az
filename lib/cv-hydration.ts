import type { CVSection } from "@/types/cv-document";
import type { EditorElement } from "@/types/cv-document";
import { CANVAS_PADDING, nextZIndex } from "@/lib/layout-engine";
import { defaultContent } from "@/lib/cv-normalizer";

const BASE_SECTIONS = defaultContent().sections ?? [];

function cloneSections(sections: CVSection[]): CVSection[] {
  return JSON.parse(JSON.stringify(sections)) as CVSection[];
}

/** Convert AI generator flat payload → builder sections */
export function generatorDataToSections(data: Record<string, unknown>): CVSection[] {
  const sections = cloneSections(BASE_SECTIONS);

  const personal = sections.find((s) => s.type === "personal");
  if (personal) {
    personal.content = {
      name: String(data.fullName ?? data.name ?? ""),
      title: String(data.title ?? ""),
      email: String(data.email ?? ""),
      phone: String(data.phone ?? ""),
      location: String(data.location ?? ""),
      website: String(data.website ?? ""),
      linkedin: String(data.linkedin ?? ""),
    };
  }

  const summary = sections.find((s) => s.type === "summary");
  if (summary && data.summary) summary.content = String(data.summary);

  const experience = sections.find((s) => s.type === "experience");
  if (experience && Array.isArray(data.experience)) {
    experience.content = data.experience.map((exp: Record<string, unknown>) => ({
      title: String(exp.title ?? ""),
      company: String(exp.company ?? ""),
      startDate: String(exp.startDate ?? ""),
      endDate: String(exp.endDate ?? "Present"),
      description: Array.isArray(exp.description)
        ? exp.description
        : exp.description
          ? [String(exp.description)]
          : [],
    }));
  }

  const education = sections.find((s) => s.type === "education");
  if (education && Array.isArray(data.education)) {
    education.content = data.education.map((edu: Record<string, unknown>) => ({
      degree: String(edu.degree ?? ""),
      university: String(edu.university ?? edu.school ?? ""),
      graduationYear: String(edu.graduationYear ?? edu.year ?? ""),
      gpa: edu.gpa ? String(edu.gpa) : undefined,
    }));
  }

  const skills = sections.find((s) => s.type === "skills");
  if (skills) {
    if (Array.isArray(data.skills)) skills.content = data.skills;
    else if (typeof data.skills === "string")
      skills.content = data.skills.split(",").map((s) => s.trim()).filter(Boolean);
  }

  return sections;
}

/** Convert example gallery content → builder sections */
export function exampleContentToSections(example: {
  cvContent?: Record<string, unknown>;
  name?: string;
}): CVSection[] {
  const content = example.cvContent as Record<string, unknown> | undefined;
  if (!content) return cloneSections(BASE_SECTIONS);

  const personal = content.personal as Record<string, string> | undefined;
  return generatorDataToSections({
    fullName: personal?.fullName ?? example.name,
    title: personal?.title,
    email: personal?.email,
    phone: personal?.phone,
    location: personal?.location,
    website: personal?.website,
    summary: content.summary,
    experience: content.experience,
    education: content.education,
    skills: content.skills,
  });
}

export interface HydratedCvData {
  id?: string;
  templateId?: number;
  templateName?: string;
  sections: CVSection[];
  canvas?: unknown;
  mode?: "form" | "visual";
  metadata?: { version: number };
  generatorData?: Record<string, unknown>;
  status?: string;
}

/** Ensure sections exist — hydrate from generatorData if needed */
export function hydrateCvData(raw: HydratedCvData): HydratedCvData {
  const hasSections =
    Array.isArray(raw.sections) &&
    raw.sections.some((s) => {
      if (s.type === "personal") {
        const c = s.content as Record<string, string>;
        return Boolean(c?.name || c?.email);
      }
      if (s.type === "summary") return Boolean(s.content);
      if (s.type === "experience") return Array.isArray(s.content) && s.content.length > 0;
      return false;
    });

  if (!hasSections && raw.generatorData && typeof raw.generatorData === "object") {
    return {
      ...raw,
      mode: raw.mode ?? "form",
      sections: generatorDataToSections(raw.generatorData as Record<string, unknown>),
    };
  }

  if (!raw.sections?.length) {
    return { ...raw, sections: cloneSections(BASE_SECTIONS) };
  }

  return raw;
}

/** Form sections → visual canvas elements */
export function sectionsToCanvasElements(sections: CVSection[]): EditorElement[] {
  const personal = sections.find((s) => s.type === "personal");
  const p = (personal?.content ?? {}) as Record<string, string>;
  const summary = sections.find((s) => s.type === "summary");
  const experience = sections.find((s) => s.type === "experience");
  const education = sections.find((s) => s.type === "education");
  const skills = sections.find((s) => s.type === "skills");

  const elements: EditorElement[] = [
    {
      id: "heading-name",
      type: "text",
      x: CANVAS_PADDING,
      y: CANVAS_PADDING,
      width: 400,
      height: 36,
      zIndex: 1,
      text: p.name || "Your Name",
      fontSize: 28,
      fontWeight: "bold",
      fill: "#18181b",
    },
    {
      id: "heading-title",
      type: "text",
      x: CANVAS_PADDING,
      y: CANVAS_PADDING + 44,
      width: 400,
      height: 24,
      zIndex: 2,
      text: p.title || "Professional Title",
      fontSize: 14,
      fill: "#52525b",
    },
  ];

  const contactParts = [p.email, p.phone, p.location].filter(Boolean);
  if (contactParts.length) {
    elements.push({
      id: "heading-contact",
      type: "text",
      x: CANVAS_PADDING,
      y: CANVAS_PADDING + 72,
      width: 698,
      height: 20,
      zIndex: 3,
      text: contactParts.join(" · "),
      fontSize: 11,
      fill: "#71717a",
    });
  }

  let y = CANVAS_PADDING + (contactParts.length ? 100 : 90);

  if (summary?.content) {
    elements.push({
      id: "section-summary",
      type: "section",
      x: CANVAS_PADDING,
      y,
      width: 698,
      height: 72,
      zIndex: nextZIndex(elements),
      sectionType: "summary",
      content: String(summary.content),
      fontSize: 12,
      fill: "#3f3f46",
    });
    y += 88;
  }

  if (Array.isArray(experience?.content) && experience.content.length > 0) {
    const lines = (experience.content as Record<string, unknown>[]).slice(0, 4).flatMap((e) => {
      const header = `${e.title} at ${e.company}`;
      const bullets = Array.isArray(e.description)
        ? (e.description as string[]).slice(0, 2).map((b) => `• ${b}`)
        : [];
      return [header, ...bullets];
    });
    elements.push({
      id: "section-experience",
      type: "section",
      x: CANVAS_PADDING,
      y,
      width: 698,
      height: Math.min(160, 24 + lines.length * 16),
      zIndex: nextZIndex(elements),
      sectionType: "experience",
      content: lines.join("\n"),
      fontSize: 12,
      fill: "#3f3f46",
    });
    y += Math.min(168, 32 + lines.length * 16);
  }

  if (Array.isArray(education?.content) && education.content.length > 0) {
    const text = (education.content as Record<string, string>[])
      .map((e) => `${e.degree}${e.university ? ` — ${e.university}` : ""}${e.graduationYear ? ` (${e.graduationYear})` : ""}`)
      .join("\n");
    elements.push({
      id: "section-education",
      type: "section",
      x: CANVAS_PADDING,
      y,
      width: 698,
      height: 64,
      zIndex: nextZIndex(elements),
      sectionType: "education",
      content: text,
      fontSize: 12,
      fill: "#3f3f46",
    });
    y += 72;
  }

  if (Array.isArray(skills?.content) && skills.content.length > 0) {
    elements.push({
      id: "section-skills",
      type: "section",
      x: CANVAS_PADDING,
      y,
      width: 698,
      height: 48,
      zIndex: nextZIndex(elements),
      sectionType: "skills",
      content: (skills.content as string[]).join(" · "),
      fontSize: 12,
      fill: "#3f3f46",
    });
  }

  return elements;
}

/** Visual canvas → form sections */
export function canvasToSections(elements: EditorElement[]): CVSection[] {
  const sections = cloneSections(BASE_SECTIONS);

  const nameEl = elements.find((e) => e.id === "heading-name");
  const titleEl = elements.find((e) => e.id === "heading-title");
  const contactEl = elements.find((e) => e.id === "heading-contact");
  const personal = sections.find((s) => s.type === "personal");
  if (personal) {
    const contact = contactEl?.text?.split(" · ") ?? [];
    personal.content = {
      name: nameEl?.text ?? "",
      title: titleEl?.text ?? "",
      email: contact[0]?.includes("@") ? contact[0] : "",
      phone: contact.find((p) => /\+|\d{3}/.test(p)) ?? "",
      location: contact.find((p) => !p.includes("@") && !/\+|\d{3}/.test(p)) ?? "",
      linkedin: "",
      website: "",
    };
  }

  const summaryEl = elements.find(
    (e) => e.type === "section" && (e.sectionType === "summary" || e.id === "section-summary")
  );
  const summary = sections.find((s) => s.type === "summary");
  if (summary && summaryEl?.content) summary.content = String(summaryEl.content);

  const expEl = elements.find(
    (e) => e.type === "section" && (e.sectionType === "experience" || e.id === "section-experience")
  );
  const experience = sections.find((s) => s.type === "experience");
  if (experience && expEl?.content) {
    experience.content = String(expEl.content)
      .split("\n")
      .filter((line) => line && !line.startsWith("•"))
      .map((line) => {
        const atIdx = line.indexOf(" at ");
        return {
          title: atIdx > 0 ? line.slice(0, atIdx) : line,
          company: atIdx > 0 ? line.slice(atIdx + 4) : "",
          startDate: "",
          endDate: "Present",
          description: [],
        };
      });
  }

  const eduEl = elements.find(
    (e) => e.type === "section" && (e.sectionType === "education" || e.id === "section-education")
  );
  const education = sections.find((s) => s.type === "education");
  if (education && eduEl?.content) {
    education.content = String(eduEl.content)
      .split("\n")
      .filter(Boolean)
      .map((line) => ({
        degree: line.split(" — ")[0] ?? line,
        university: line.includes(" — ") ? line.split(" — ")[1]?.replace(/\s*\(\d{4}\)$/, "") ?? "" : "",
        graduationYear: line.match(/\((\d{4})\)/)?.[1] ?? "",
      }));
  }

  const skillsEl = elements.find(
    (e) => e.type === "section" && (e.sectionType === "skills" || e.id === "section-skills")
  );
  const skills = sections.find((s) => s.type === "skills");
  if (skills && skillsEl?.content) {
    skills.content = String(skillsEl.content)
      .split(/[,·\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return sections;
}

export const EXAMPLE_IMPORT_KEY = "smartcv_import_example";

export function readExampleImport(): {
  cvContent?: Record<string, unknown>;
  template?: string;
  name?: string;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(EXAMPLE_IMPORT_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(EXAMPLE_IMPORT_KEY);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
