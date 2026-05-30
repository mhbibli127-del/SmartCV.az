import type { EditorElement } from "@/types/cv-document";
import {
  A4_HEIGHT,
  A4_WIDTH,
  autoSpacing,
  clampElement,
  MIN_ELEMENT_HEIGHT,
  MIN_ELEMENT_WIDTH,
} from "@/lib/layout-engine";
import { isTemplateBaseImage } from "@/lib/cv-editor/template-base-layer";

export type CanvasLayoutMode = "absolute" | "flow";

const DEFAULT_WIDTH = 100;
const DEFAULT_HEIGHT = 40;

/** Normalize numeric geometry and stable z-order for Konva rendering. */
export function normalizeElementGeometry(
  el: EditorElement,
  index: number
): EditorElement {
  return {
    ...el,
    x: Number(el.x) || 0,
    y: Number(el.y) || 0,
    width: Math.max(MIN_ELEMENT_WIDTH, Number(el.width) || DEFAULT_WIDTH),
    height: Math.max(MIN_ELEMENT_HEIGHT, Number(el.height) || DEFAULT_HEIGHT),
    zIndex: el.zIndex ?? index + 1,
    page: el.page ?? 1,
  };
}

/** Clamp to page bounds without forcing content padding (template-safe). */
export function clampElementBounds(
  el: EditorElement,
  options?: { preserveAbsolute?: boolean }
): EditorElement {
  const preserve =
    options?.preserveAbsolute ||
    isTemplateBaseImage(el.id) ||
    isFullBleedElement(el);

  const width = Math.max(
    MIN_ELEMENT_WIDTH,
    Math.min(el.width, preserve ? A4_WIDTH : A4_WIDTH - 96)
  );
  const height = Math.max(MIN_ELEMENT_HEIGHT, el.height);

  if (preserve) {
    const x = Math.max(0, Math.min(el.x, A4_WIDTH - width));
    const y = Math.max(0, Math.min(el.y, A4_HEIGHT - height));
    return { ...el, x, y, width, height };
  }

  return clampElement({ ...el, width, height });
}

function isFullBleedElement(el: EditorElement): boolean {
  if (el.x === 0 && el.width >= A4_WIDTH - 2) return true;
  if (el.x === 0 && el.height >= A4_HEIGHT - 2) return true;
  return false;
}

export function normalizeElements(elements: EditorElement[]): EditorElement[] {
  return elements
    .map(normalizeElementGeometry)
    .sort((a, b) => a.zIndex - b.zIndex);
}

/** Template hydration — preserve designer coordinates, no vertical reflow. */
export function prepareTemplateCanvasElements(
  elements: EditorElement[]
): EditorElement[] {
  const withoutBase = elements.filter((el) => !isTemplateBaseImage(el.id));
  return normalizeElements(withoutBase).map((el) =>
    clampElementBounds(el, { preserveAbsolute: true })
  );
}

/** User flow canvas — stack sections with padding-aware spacing. */
export function prepareFlowCanvasElements(
  elements: EditorElement[]
): EditorElement[] {
  return autoSpacing(normalizeElements(elements));
}

export function applyLayoutPipeline(
  elements: EditorElement[],
  mode: CanvasLayoutMode
): EditorElement[] {
  return mode === "absolute"
    ? prepareTemplateCanvasElements(elements)
    : prepareFlowCanvasElements(elements);
}

export function clampForLayoutMode(
  el: EditorElement,
  mode: CanvasLayoutMode
): EditorElement {
  return mode === "absolute"
    ? clampElementBounds(el, { preserveAbsolute: true })
    : clampElement(el);
}

export function hasTemplateBaseLayer(elements: EditorElement[]): boolean {
  return elements.some((el) => isTemplateBaseImage(el.id));
}
