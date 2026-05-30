import type { CvEditorElement, CvEditorTemplate } from "@/types/cv-editor";
import { A4_HEIGHT, A4_WIDTH } from "@/lib/layout-engine";

/** Full-page template preview — static design layer (z-index 0) matching gallery SVG. */
export const TEMPLATE_BASE_IMAGE_ID = "template-base";

export function getTemplatePreviewSrc(template: CvEditorTemplate): string {
  return template.previewImage?.trim() || `/templates/${template.slug}.svg`;
}

export function isTemplateBaseImage(id: string): boolean {
  return id === TEMPLATE_BASE_IMAGE_ID;
}

export function createTemplateBaseImageElement(
  template: CvEditorTemplate
): CvEditorElement {
  return {
    id: TEMPLATE_BASE_IMAGE_ID,
    type: "image",
    x: 0,
    y: 0,
    width: A4_WIDTH,
    height: A4_HEIGHT,
    rotation: 0,
    content: "",
    zIndex: 0,
    locked: true,
    src: getTemplatePreviewSrc(template),
    style: {},
  };
}

/** Insert locked full-page SVG preview; editable content renders as Konva overlay. */
export function injectTemplateBaseLayer(
  elements: CvEditorElement[],
  template: CvEditorTemplate
): CvEditorElement[] {
  const withoutBase = elements.filter((el) => !isTemplateBaseImage(el.id));
  const base = createTemplateBaseImageElement(template);
  const layered = withoutBase.map((el) => ({
    ...el,
    zIndex: Math.max(el.zIndex, 1),
  }));
  return [base, ...layered];
}
