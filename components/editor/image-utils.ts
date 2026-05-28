import type { EditorElement } from "@/types/cv-document";

export function imageCornerRadius(element: EditorElement): number {
  const shape = element.imageShape ?? "rounded";
  if (shape === "circle") return Math.min(element.width, element.height) / 2;
  if (shape === "rounded") return element.cornerRadius ?? 12;
  return 0;
}

export function getImageCrop(
  image: HTMLImageElement,
  scale: number
): { x: number; y: number; width: number; height: number } {
  const s = Math.max(1, scale);
  const cropW = image.width / s;
  const cropH = image.height / s;
  return {
    x: (image.width - cropW) / 2,
    y: (image.height - cropH) / 2,
    width: cropW,
    height: cropH,
  };
}
