"use client";

import { useEffect, useState, type RefObject } from "react";
import {
  isCanvasRefReady,
  waitForCanvasReady,
  type CanvasPaperHandle,
} from "@/lib/canvas-ready";

/**
 * Polls until the canvas ref is mounted and the paper element has layout.
 * Re-runs when `enabled` flips (e.g. after loading finishes).
 */
export function useCanvasReady<T extends CanvasPaperHandle>(
  canvasRef: RefObject<T | null>,
  enabled = true
): boolean {
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !enabled) {
      setIsCanvasReady(false);
      return;
    }

    if (isCanvasRefReady(canvasRef)) {
      setIsCanvasReady(true);
      return;
    }

    let cancelled = false;
    setIsCanvasReady(false);

    void (async () => {
      try {
        await waitForCanvasReady(canvasRef);
        if (!cancelled) setIsCanvasReady(true);
      } catch {
        if (!cancelled) setIsCanvasReady(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [canvasRef, enabled]);

  return isCanvasReady;
}
