import type { RefObject } from "react";
import type { CanvasEditorHandle } from "@/components/editor/CanvasEditor";

const READY_FRAMES = 3;

/** Wait for fonts + layout before html2canvas export */
export async function waitForCanvasReady(
  canvasRef: RefObject<CanvasEditorHandle | null>,
  timeoutMs = 8000
): Promise<CanvasEditorHandle> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const editor = canvasRef.current;
    if (editor) {
      const paper = editor.getPaperElement();
      if (paper && paper.offsetWidth > 0 && paper.offsetHeight > 0) {
        if (typeof document !== "undefined" && document.fonts?.ready) {
          await document.fonts.ready;
        }
        for (let i = 0; i < READY_FRAMES; i += 1) {
          await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        }
        return editor;
      }
    }
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  }

  throw new Error("Canvas not ready");
}
