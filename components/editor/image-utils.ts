import type { EditorElement } from "@/types/cv-document";
import { preloadImage } from "@/lib/wait-for-images";

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
  const imgW = image.naturalWidth || image.width;
  const imgH = image.naturalHeight || image.height;
  const cropW = imgW / s;
  const cropH = imgH / s;
  return {
    x: (imgW - cropW) / 2,
    y: (imgH - cropH) / 2,
    width: cropW,
    height: cropH,
  };
}

/**
 * Load an image rasterized at display size × devicePixelRatio for sharp Konva rendering.
 * Upscales low-res SVG thumbnails without canvas blur artifacts.
 */
export async function loadCanvasImage(
  src: string,
  displayWidth: number,
  displayHeight: number,
  fallbackSrc?: string
): Promise<HTMLImageElement | null> {
  const loaded = await preloadImage(src, fallbackSrc);
  if (!loaded || typeof window === "undefined") return loaded;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const targetW = Math.max(1, Math.ceil(displayWidth * dpr));
  const targetH = Math.max(1, Math.ceil(displayHeight * dpr));

  if (loaded.naturalWidth >= targetW && loaded.naturalHeight >= targetH) {
    return loaded;
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return loaded;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(loaded, 0, 0, targetW, targetH);

  return new Promise((resolve) => {
    const out = new Image();
    out.onload = () => resolve(out);
    out.onerror = () => resolve(loaded);
    out.src = canvas.toDataURL("image/png");
  });
}
