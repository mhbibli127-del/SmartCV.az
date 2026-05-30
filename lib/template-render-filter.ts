import type { EditorElement } from "@/types/cv-document";
import { isTemplateBaseImage } from "@/lib/cv-editor/template-base-layer";
import { hasTemplateBaseLayer } from "@/lib/canvas-layout";

/** Static section headings baked into the SVG preview — skip Konva duplicate. */
function isStaticTemplateLabel(id: string): boolean {
  if (id.startsWith("skill-label-")) return false;
  if (id.endsWith("-label")) return true;
  return false;
}

/**
 * When a full-page template preview image is present, render only editable
 * content on top (text + photos). Decorative shapes/labels live in the SVG.
 */
export function isTemplateOverlayElement(el: EditorElement): boolean {
  if (isTemplateBaseImage(el.id)) return true;
  if (el.type === "image") return true;
  if (el.type === "text" && !isStaticTemplateLabel(el.id)) return true;
  return false;
}

export function filterTemplateOverlayElements(elements: EditorElement[]): EditorElement[] {
  if (!hasTemplateBaseLayer(elements)) return elements;
  return elements.filter(isTemplateOverlayElement);
}
