import type { CvEditorElement } from "@/types/cv-editor";
import { DEFAULT_PORTRAIT_SRC } from "@/templates/shared";
import { isTemplateBaseImage } from "@/lib/cv-editor/template-base-layer";

export { DEFAULT_PORTRAIT_SRC };

/** Ensure image slots always have a usable src. */
export function resolveImageSrc(src?: string | null): string {
  const trimmed = src?.trim();
  return trimmed || DEFAULT_PORTRAIT_SRC;
}

/** Assign a default portrait when template image slots have no src. */
export function injectDefaultImageSources(elements: CvEditorElement[]): CvEditorElement[] {
  return elements.map((element) => {
    if (element.type !== "image") return element;
    if (isTemplateBaseImage(element.id)) return element;
    return { ...element, src: resolveImageSrc(element.src) };
  });
}

/** Keep user-uploaded photos when switching templates. */
export function preserveImageSources(
  built: CvEditorElement[],
  current: CvEditorElement[]
): CvEditorElement[] {
  const srcById = new Map(
    current
      .filter((el) => el.type === "image" && el.src?.trim())
      .map((el) => [el.id, el.src!])
  );

  return built.map((el) => {
    const preserved = srcById.get(el.id);
    if (preserved && el.type === "image") {
      return { ...el, src: preserved };
    }
    return el;
  });
}
