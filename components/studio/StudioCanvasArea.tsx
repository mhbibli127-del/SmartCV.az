"use client";

import { memo } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { CanvasEditorHandle } from "@/components/editor/CanvasEditor";
import { StudioPageNavigator } from "@/components/studio/StudioPageNavigator";
import { StudioRulers } from "@/components/studio/StudioRulers";
import { StudioOverflowBanner } from "@/components/studio/StudioOverflowBanner";
import { useEditorStore } from "@/lib/editor-store";
import { A4_HEIGHT, A4_WIDTH } from "@/lib/layout-engine";

const CanvasEditor = dynamic(
  () => import("@/components/editor/CanvasEditor").then((m) => m.CanvasEditor),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex items-center justify-center bg-white"
        style={{ width: A4_WIDTH, height: A4_HEIGHT }}
      >
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    ),
  }
);

interface StudioCanvasAreaProps {
  canvasRef: React.RefObject<CanvasEditorHandle>;
  zoom: number;
}

function StudioCanvasAreaInner({ canvasRef, zoom }: StudioCanvasAreaProps) {
  const showRulers = useEditorStore((s) => s.showRulers);
  const activePage = useEditorStore((s) => s.activePage);
  const pageCount = useEditorStore((s) => s.pageCount);

  return (
    <div className="relative flex min-w-0 flex-1 flex-col bg-[#e8e8ea]">
      <StudioOverflowBanner />
      <div className="flex flex-1 items-start justify-center overflow-auto px-4 py-8 sm:px-8 sm:py-10 md:px-12 md:py-12">
        <div className="relative">
          {showRulers && (
            <div className="absolute -left-5 -top-5">
              <StudioRulers zoom={zoom} />
            </div>
          )}
          <div
            style={{
              width: A4_WIDTH,
              height: A4_HEIGHT,
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
              transition: "transform 0.2s ease-out",
            }}
          >
            <div
              className="overflow-hidden rounded-sm bg-white"
              style={{
                width: A4_WIDTH,
                height: A4_HEIGHT,
                boxShadow:
                  "0 1px 2px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.12), 0 24px 48px rgba(0,0,0,0.08)",
              }}
            >
              <CanvasEditor ref={canvasRef} embedded zoom={zoom} />
            </div>
          </div>
          {pageCount > 1 && (
            <p className="mt-3 text-center text-[11px] text-zinc-500">
              Page {activePage} of {pageCount}
            </p>
          )}
        </div>
      </div>
      <StudioPageNavigator />
    </div>
  );
}

export const StudioCanvasArea = memo(StudioCanvasAreaInner);
