import type { EditorElement } from "@/types/cv-document";
import type { CanvasLayoutMode } from "@/lib/canvas-layout";
import { A4_HEIGHT, A4_WIDTH, CANVAS_PADDING } from "@/lib/layout-engine";

export type HorizontalAlign = "left" | "center" | "right";
export type VerticalAlign = "top" | "middle" | "bottom";

function contentPadding(layoutMode: CanvasLayoutMode): number {
  return layoutMode === "absolute" ? 0 : CANVAS_PADDING;
}

export function alignElementX(
  el: EditorElement,
  mode: HorizontalAlign,
  layoutMode: CanvasLayoutMode
): number {
  const pad = contentPadding(layoutMode);
  const innerW = A4_WIDTH - pad * 2;
  if (mode === "left") return pad;
  if (mode === "center") return Math.round(pad + (innerW - el.width) / 2);
  return Math.round(A4_WIDTH - pad - el.width);
}

export function alignElementY(
  el: EditorElement,
  mode: VerticalAlign,
  layoutMode: CanvasLayoutMode
): number {
  const pad = contentPadding(layoutMode);
  const innerH = A4_HEIGHT - pad * 2;
  if (mode === "top") return pad;
  if (mode === "middle") return Math.round(pad + (innerH - el.height) / 2);
  return Math.round(A4_HEIGHT - pad - el.height);
}
