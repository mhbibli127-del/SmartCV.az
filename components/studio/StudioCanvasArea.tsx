"use client";

import { memo, useState } from "react";
import dynamic from "next/dynamic";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Loader2 } from "lucide-react";
import type { CanvasEditorHandle } from "@/components/editor/CanvasEditor";

const CanvasEditor = dynamic(
  () => import("@/components/editor/CanvasEditor").then((m) => m.CanvasEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    ),
  }
);

interface StudioCanvasAreaProps {
  canvasRef: React.RefObject<CanvasEditorHandle>;
}

function StudioCanvasAreaInner({ canvasRef }: StudioCanvasAreaProps) {
  const [zoom, setZoom] = useState(1);

  const zoomIn = () => setZoom((z) => Math.min(1.5, z + 0.1));
  const zoomOut = () => setZoom((z) => Math.max(0.5, z - 0.1));
  const resetZoom = () => setZoom(1);

  return (
    <div className="relative flex min-w-0 flex-1 flex-col bg-zinc-100/80">
      <div className="absolute right-4 top-4 z-20 flex items-center gap-1 rounded-xl border border-zinc-200/80 bg-white/95 p-1 shadow-sm backdrop-blur-sm">
        <button
          type="button"
          onClick={zoomOut}
          className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="min-w-[3rem] text-center text-xs font-medium text-zinc-600">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={zoomIn}
          className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={resetZoom}
          className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100"
          aria-label="Reset zoom"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 items-start justify-center overflow-auto p-8">
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top center",
            transition: "transform 0.15s ease",
          }}
        >
          <CanvasEditor ref={canvasRef} />
        </div>
      </div>
    </div>
  );
}

export const StudioCanvasArea = memo(StudioCanvasAreaInner);
