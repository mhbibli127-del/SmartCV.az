import type { RefObject } from "react";
import { waitForImages } from "@/lib/wait-for-images";

export type CanvasPaperHandle = {
  getPaperElement: () => HTMLElement | null;
  isReady?: () => boolean;
  exportPng?: () => string | null;
};

const READY_FRAMES = 3;
const SETTLE_MS = 300;

export type CanvasPaperRef<T extends CanvasPaperHandle = CanvasPaperHandle> =
  RefObject<T | null>;

function isPaperElementReady(paper: HTMLElement): boolean {
  return paper.isConnected && paper.offsetWidth > 0 && paper.offsetHeight > 0;
}

function isEditorHandleReady(editor: CanvasPaperHandle): boolean {
  if (editor.isReady?.()) return true;
  const paper = editor.getPaperElement();
  return Boolean(paper && isPaperElementReady(paper));
}

/** Wait for fonts, layout, and Konva/DOM paper before html2canvas or stage export. */
export async function waitForCanvasReady<T extends CanvasPaperHandle>(
  canvasRef: CanvasPaperRef<T>,
  timeoutMs = 12000
): Promise<T> {
  if (typeof window === "undefined") {
    throw new Error("Canvas not ready");
  }

  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const editor = canvasRef.current;
    if (editor && isEditorHandleReady(editor)) {
      if (typeof document !== "undefined" && document.fonts?.ready) {
        await document.fonts.ready;
      }
      for (let i = 0; i < READY_FRAMES; i += 1) {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      }
      const paper = editor.getPaperElement();
      if (paper) {
        await waitForImages(paper, 500);
      } else {
        await new Promise<void>((resolve) => setTimeout(resolve, SETTLE_MS));
      }
      return editor as T;
    }
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  }

  throw new Error("Canvas not ready");
}

/** Sync check for disabling export buttons. */
export function isCanvasRefReady<T extends CanvasPaperHandle>(
  canvasRef: CanvasPaperRef<T>
): boolean {
  const editor = canvasRef.current;
  return Boolean(editor && isEditorHandleReady(editor));
}
