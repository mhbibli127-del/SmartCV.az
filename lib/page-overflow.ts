import type { EditorElement } from "@/types/cv-document";
import { A4_HEIGHT, CANVAS_PADDING, SECTION_GAP } from "@/lib/layout-engine";

export function getPageElements(elements: EditorElement[], page: number): EditorElement[] {
  return elements.filter((el) => (el.page ?? 1) === page);
}

export function getOverflowElements(elements: EditorElement[], page: number): EditorElement[] {
  const limit = A4_HEIGHT - CANVAS_PADDING;
  return getPageElements(elements, page).filter((el) => el.y + el.height > limit);
}

export function hasPageOverflow(elements: EditorElement[], page: number): boolean {
  return getOverflowElements(elements, page).length > 0;
}

export function repositionForPage(elements: EditorElement[], page: number): EditorElement[] {
  const limit = A4_HEIGHT - CANVAS_PADDING;
  let y = CANVAS_PADDING;
  const sorted = getPageElements(elements, page).sort((a, b) => a.y - b.y || a.zIndex - b.zIndex);

  const repositioned = new Map<string, EditorElement>();
  for (const el of sorted) {
    const next = { ...el, y: Math.min(y, limit - el.height) };
    repositioned.set(el.id, next);
    y = next.y + next.height + SECTION_GAP;
  }

  return elements.map((el) => {
    if ((el.page ?? 1) !== page) return el;
    return repositioned.get(el.id) ?? el;
  });
}
