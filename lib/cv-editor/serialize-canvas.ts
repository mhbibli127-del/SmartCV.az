import type { EditorCanvasState, EditorElement } from "@/types/cv-document";
import type { CvEditorElement } from "@/types/cv-editor";
import { A4_HEIGHT, A4_WIDTH } from "@/lib/layout-engine";
import { mapFontWeight } from "@/lib/cv-text-style";

export function cvElementsToApiCanvas(
  elements: CvEditorElement[],
  background: string
): EditorCanvasState {
  const mapped: EditorElement[] = elements.map((el) => ({
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
    fontWeight: mapFontWeight(el.style.fontWeight),
    locked: el.locked,
    src: el.src,
    opacity: el.style.opacity,
    cornerRadius: el.style.borderRadius,
    sectionType: el.sectionType as EditorElement["sectionType"],
  }));

  return {
    width: A4_WIDTH,
    height: A4_HEIGHT,
    background,
    elements: mapped,
  };
}

export function apiCanvasToCvElements(canvas: EditorCanvasState): CvEditorElement[] {
  return canvas.elements.map((el) => ({
    id: el.id,
    type: el.type === "image" ? "image" : el.type === "section" ? "section" : "text",
    x: el.x,
    y: el.y,
    width: el.width,
    height: el.height,
    rotation: 0,
    content: el.text ?? el.content ?? "",
    locked: el.locked,
    src: el.src,
    sectionType: el.sectionType,
    zIndex: el.zIndex,
    style: {
      fontSize: el.fontSize,
      fontFamily: el.fontFamily,
      color: el.fill,
      fontWeight: el.fontWeight,
      borderRadius: el.cornerRadius,
      opacity: el.opacity,
    },
  }));
}
