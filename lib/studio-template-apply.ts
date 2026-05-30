import type { EditorElement } from "@/types/cv-document";
import {
  buildElementsFromTemplate,
  getEditorTemplate,
} from "@/lib/cv-editor/template-catalog";
import {
  getTemplatePreviewSrc,
  isTemplateBaseImage,
  TEMPLATE_BASE_IMAGE_ID,
} from "@/lib/cv-editor/template-base-layer";
import { getDistinctTemplate } from "@/lib/cv-editor/template-definitions";
import { resolveTemplateSlug } from "@/templates/data/catalog";
import { SAMPLE, type ResumeSampleData } from "@/templates/shared";
import { getCoreTemplateBySlug } from "@/lib/design-engine/core-templates";
import { getTemplateBySlug } from "@/lib/design-engine/template-catalog";
import { extractResumeData } from "@/lib/cv-editor/resume-data";
import type { CvEditorElement } from "@/types/cv-editor";
import { normalizeElementGeometry } from "@/lib/canvas-layout";
import { mapCvStyleToEditorProps } from "@/lib/cv-text-style";
import { parseCssBorder, resolveLayoutShapeType } from "@/lib/cv-shape-style";

function isLayoutBlock(el: CvEditorElement): boolean {
  return el.type === "section" && !el.content?.trim() && Boolean(el.style.background);
}

export function cvElementsToEditorElements(elements: CvEditorElement[]): EditorElement[] {
  return elements.map((el, index) => {
    const layoutBlock = isLayoutBlock(el);
    const styleProps = mapCvStyleToEditorProps(el.style);
    const borderProps = layoutBlock ? parseCssBorder(el.style.border) : {};
    const editorEl: EditorElement = {
      id: el.id,
      type: layoutBlock
        ? "shape"
        : el.type === "section"
          ? "section"
          : el.type === "image"
            ? "image"
            : "text",
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height,
      zIndex: el.zIndex,
      text: el.content,
      content: el.content,
      ...styleProps,
      ...borderProps,
      locked: el.locked ?? layoutBlock,
      src: el.src,
      sectionType: el.sectionType as EditorElement["sectionType"],
      shapeType: layoutBlock ? resolveLayoutShapeType(el) : undefined,
      ...(el.type === "image" && (el.style.borderRadius ?? 0) >= 999
        ? { imageShape: "circle" as const, cornerRadius: el.width / 2 }
        : {}),
    };
    return normalizeElementGeometry(editorEl, index);
  });
}

export function buildStudioElementsForTemplate(slugOrId: string): EditorElement[] {
  const slug = resolveTemplateSlug(slugOrId) ?? slugOrId;
  const editorTpl = getEditorTemplate(slug);
  if (!editorTpl) return [];
  const built = buildElementsFromTemplate(editorTpl, SAMPLE);
  return cvElementsToEditorElements(built);
}

/** Preload preview image, then build editor elements (avoids blank canvas on template apply). */
export async function buildStudioElementsForTemplateAsync(
  slugOrId: string,
  resumeData?: Partial<ResumeSampleData>
): Promise<EditorElement[]> {
  const slug = resolveTemplateSlug(slugOrId) ?? slugOrId;
  const editorTpl = getEditorTemplate(slug);
  if (!editorTpl) return [];

  const built = buildElementsFromTemplate(editorTpl, resumeData);
  return cvElementsToEditorElements(built);
}

export { TEMPLATE_BASE_IMAGE_ID, getTemplatePreviewSrc, isTemplateBaseImage };

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
  const srcById = new Map(
    current
      .filter((el) => el.type === "image" && el.src?.trim())
      .map((el) => [el.id, el.src!])
  );
  return built.map((el) => ({
    ...el,
    text: textById.get(el.id) ?? el.text,
    content: textById.get(el.id) ?? el.content,
    src: isTemplateBaseImage(el.id) ? el.src : srcById.get(el.id) ?? el.src,
  }));
}

export function normalizeTemplateSlug(slugOrId: string | null): string | null {
  if (!slugOrId) return null;
  const resolved = resolveTemplateSlug(slugOrId);
  if (resolved) return resolved;
  const def = getDistinctTemplate(slugOrId);
  return def?.slug ?? slugOrId;
}
