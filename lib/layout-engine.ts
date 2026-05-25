import type { EditorCanvasState, EditorElement } from "@/types/cv-document";

/** A4 at 96 DPI — standard print dimensions */
export const A4_WIDTH = 794;
export const A4_HEIGHT = 1123;
export const CANVAS_PADDING = 48;
export const MIN_ELEMENT_WIDTH = 80;
export const MIN_ELEMENT_HEIGHT = 24;
export const SECTION_GAP = 16;

export function createDefaultCanvas(): EditorCanvasState {
  return {
    width: A4_WIDTH,
    height: A4_HEIGHT,
    background: "#ffffff",
    elements: [
      {
        id: "heading-name",
        type: "text",
        x: CANVAS_PADDING,
        y: CANVAS_PADDING,
        width: 400,
        height: 36,
        zIndex: 1,
        text: "Your Name",
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
        text: "Professional Title",
        fontSize: 14,
        fill: "#52525b",
      },
    ],
  };
}

export function clampElement(el: EditorElement): EditorElement {
  const maxW = A4_WIDTH - CANVAS_PADDING * 2;
  const width = Math.max(MIN_ELEMENT_WIDTH, Math.min(el.width, maxW));
  const height = Math.max(MIN_ELEMENT_HEIGHT, el.height);

  let x = Math.max(CANVAS_PADDING, el.x);
  let y = Math.max(CANVAS_PADDING, el.y);
  x = Math.min(x, A4_WIDTH - CANVAS_PADDING - width);
  y = Math.min(y, A4_HEIGHT - CANVAS_PADDING - height);

  return { ...el, x, y, width, height };
}

export function clampAllElements(elements: EditorElement[]): EditorElement[] {
  return elements.map(clampElement).sort((a, b) => a.zIndex - b.zIndex);
}

/** Prevent vertical overflow by shifting elements upward if needed */
export function resolveOverflow(elements: EditorElement[]): EditorElement[] {
  const sorted = [...elements].sort((a, b) => a.y - b.y);
  const result: EditorElement[] = [];

  for (let i = 0; i < sorted.length; i++) {
    let el = clampElement(sorted[i]);
    if (i > 0) {
      const prev = result[i - 1];
      const minY = prev.y + prev.height + SECTION_GAP;
      if (el.y < minY && el.y >= prev.y) {
        el = { ...el, y: minY };
      }
    }
    if (el.y + el.height > A4_HEIGHT - CANVAS_PADDING) {
      el = {
        ...el,
        y: Math.max(CANVAS_PADDING, A4_HEIGHT - CANVAS_PADDING - el.height),
      };
    }
    result.push(el);
  }

  return clampAllElements(result);
}

export function autoSpacing(elements: EditorElement[]): EditorElement[] {
  return resolveOverflow(elements);
}

export function nextZIndex(elements: EditorElement[]): number {
  if (elements.length === 0) return 1;
  return Math.max(...elements.map((e) => e.zIndex)) + 1;
}

export function isWithinBounds(el: EditorElement): boolean {
  return (
    el.x >= CANVAS_PADDING &&
    el.y >= CANVAS_PADDING &&
    el.x + el.width <= A4_WIDTH - CANVAS_PADDING &&
    el.y + el.height <= A4_HEIGHT - CANVAS_PADDING
  );
}

export const GRID_SIZE = 8;

export function snapToGrid(value: number, grid = GRID_SIZE): number {
  return Math.round(value / grid) * grid;
}

export function snapElementToGrid(el: EditorElement, grid = GRID_SIZE): EditorElement {
  return clampElement({
    ...el,
    x: snapToGrid(el.x, grid),
    y: snapToGrid(el.y, grid),
  });
}
