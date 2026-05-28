import type { EditorElement } from "@/types/cv-document";
import {
  buildElementsFromTemplate,
  getEditorTemplate,
} from "@/lib/cv-editor/template-catalog";
import { getDistinctTemplate } from "@/lib/cv-editor/template-definitions";
import { resolveTemplateSlug } from "@/templates/data/catalog";
import { SAMPLE, type ResumeSampleData } from "@/templates/shared";
import { getCoreTemplateBySlug } from "@/lib/design-engine/core-templates";
import { getTemplateBySlug } from "@/lib/design-engine/template-catalog";
import { extractResumeData } from "@/lib/cv-editor/resume-data";
import type { CvEditorElement } from "@/types/cv-editor";

export function cvElementsToEditorElements(elements: CvEditorElement[]): EditorElement[] {
  return elements.map((el) => ({
    id: el.id,
    type: el.type === "section" ? "section" : el.type === "image" ? "image" : "text",
    x: el.x,
    y: el.y,
    width: el.width,
    height: el.height,
    zIndex: el.zIndex,
    text: el.content,
    content: el.content,
    fontSize: el.style.fontSize,
    fontFamily: el.style.fontFamily,
    fill: el.style.color,
    fontWeight: el.style.fontWeight === "bold" ? "bold" : "normal",
    lineHeight: el.style.lineHeight,
    letterSpacing: el.style.letterSpacing,
    locked: el.locked,
    src: el.src,
    sectionType: el.sectionType as EditorElement["sectionType"],
  }));
}

export function buildStudioElementsForTemplate(slugOrId: string): EditorElement[] {
  const slug = resolveTemplateSlug(slugOrId) ?? slugOrId;
  const editorTpl = getEditorTemplate(slug);
  if (!editorTpl) return [];
  const built = buildElementsFromTemplate(editorTpl, SAMPLE);
  return cvElementsToEditorElements(built);
}

export function getDesignTemplateForSlug(slugOrId: string) {
  const slug = resolveTemplateSlug(slugOrId) ?? slugOrId;
  return getCoreTemplateBySlug(slug) ?? getTemplateBySlug(slug) ?? null;
}

export function extractResumeDataFromEditor(elements: EditorElement[]): Partial<ResumeSampleData> {
  const asCv: CvEditorElement[] = elements.map((el) => ({
    id: el.id,
    type: el.type === "section" ? "section" : el.type === "image" ? "image" : "text",
    x: el.x,
    y: el.y,
    width: el.width,
    height: el.height,
    rotation: 0,
    content: el.text ?? el.content ?? "",
    zIndex: el.zIndex,
    style: {
      fontSize: el.fontSize,
      fontFamily: el.fontFamily,
      color: el.fill,
    },
    sectionType: el.sectionType,
    src: el.src,
  }));

  const fromIds = extractResumeData(asCv);
  const data: Partial<ResumeSampleData> = { ...fromIds };

  for (const el of elements) {
    const text = (el.text ?? el.content ?? "").trim();
    if (!text) continue;
    const id = el.id.toLowerCase();
    if (!data.name && (id === "name" || id.includes("name") && !id.includes("company"))) {
      data.name = text.split("\n")[0]?.trim() ?? text;
    }
    if (!data.title && (id === "title" || id.includes("title") || id.includes("headline"))) {
      data.title = text.split("\n")[0]?.trim() ?? text;
    }
    if (!data.summary && (id === "summary" || id.includes("summary"))) data.summary = text;
    if (!data.experience && (id === "experience" || id.includes("experience"))) {
      data.experience = text;
    }
    if (!data.education && (id === "education" || id.includes("education"))) {
      data.education = text;
    }
    if (!data.skills && (id === "skills" || id.includes("skill"))) data.skills = text;
    if (!data.languages && (id === "languages" || id.includes("language"))) {
      data.languages = text;
    }
    if (!data.contact && (id === "contact" || id.includes("contact"))) data.contact = text;
  }

  return data;
}

export function preserveTextContent(
  built: EditorElement[],
  current: EditorElement[]
): EditorElement[] {
  const textById = new Map(
    current
      .filter((el) => el.text || el.content)
      .map((el) => [el.id, el.text ?? el.content ?? ""])
  );
  return built.map((el) => ({
    ...el,
    text: textById.get(el.id) ?? el.text,
    content: textById.get(el.id) ?? el.content,
  }));
}

export function normalizeTemplateSlug(slugOrId: string | null): string | null {
  if (!slugOrId) return null;
  const resolved = resolveTemplateSlug(slugOrId);
  if (resolved) return resolved;
  const def = getDistinctTemplate(slugOrId);
  return def?.slug ?? slugOrId;
}
