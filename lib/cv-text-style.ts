import type { CvElementStyle } from "@/types/cv-editor";
import type { EditorElement } from "@/types/cv-document";

export function isBoldWeight(weight?: string | number | null): boolean {
  if (weight === "bold" || weight === "bolder") return true;
  if (typeof weight === "number") return weight >= 600;
  if (typeof weight === "string") {
    const n = parseInt(weight, 10);
    if (!Number.isNaN(n)) return n >= 600;
  }
  return false;
}

export function mapFontWeight(weight?: string | number | null): "normal" | "bold" {
  return isBoldWeight(weight) ? "bold" : "normal";
}

export function konvaFontStyle(
  element: Pick<EditorElement, "fontWeight" | "fontStyle">
): string {
  const parts: string[] = [];
  if (element.fontStyle === "italic") parts.push("italic");
  if (element.fontWeight === "bold") parts.push("bold");
  return parts.length > 0 ? parts.join(" ") : "normal";
}

export function mapCvStyleToEditorProps(style: Partial<CvElementStyle>) {
  return {
    fontSize: style.fontSize,
    fontFamily: style.fontFamily,
    fill: style.color ?? style.background,
    fontWeight: mapFontWeight(style.fontWeight),
    fontStyle: style.fontStyle === "italic" ? ("italic" as const) : undefined,
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing,
    textAlign: style.textAlign,
    opacity: style.opacity,
    cornerRadius: style.borderRadius,
  };
}

/** Collect unique font family names used on the canvas. */
export function collectCanvasFontFamilies(elements: EditorElement[]): string[] {
  return [
    ...new Set(
      elements.map((el) => el.fontFamily?.trim()).filter((f): f is string => Boolean(f))
    ),
  ];
}
