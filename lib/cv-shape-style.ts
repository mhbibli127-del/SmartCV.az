import type { CvEditorElement } from "@/types/cv-editor";
import type { EditorElement } from "@/types/cv-document";

export function parseCssBorder(
  border?: string
): Pick<EditorElement, "stroke" | "strokeWidth"> {
  if (!border?.trim()) return {};
  const match = border.trim().match(/^(\d+(?:\.\d+)?)px\s+\S+\s+(.+)$/);
  if (!match) return {};
  return {
    strokeWidth: Number(match[1]),
    stroke: match[2]!.trim(),
  };
}

export function resolveLayoutShapeType(
  el: CvEditorElement
): EditorElement["shapeType"] {
  if (el.height <= 4) return "line";
  if (el.style.borderRadius === 999 && Math.abs(el.width - el.height) < 4) {
    return "circle";
  }
  return "rect";
}
