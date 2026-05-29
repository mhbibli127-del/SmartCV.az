"use client";

import { memo, useCallback, useRef, forwardRef, useImperativeHandle, useEffect } from "react";
import { Stage, Layer, Rect } from "react-konva";
import type Konva from "konva";
import { ElementLayer } from "./ElementLayer";
import { AlignmentGuides } from "./AlignmentGuides";
import { SelectionTransformer } from "./SelectionTransformer";
import { InlineTextEditor } from "./InlineTextEditor";
import { StudioResizeOverlay } from "@/components/studio/StudioResizeOverlay";
import { StudioElementToolbar } from "@/components/studio/StudioElementToolbar";
import { useEditorStore } from "@/lib/editor-store";
import { useDesignStore } from "@/lib/design-store";
import { A4_HEIGHT, A4_WIDTH, CANVAS_PADDING, GRID_SIZE } from "@/lib/layout-engine";
import { themeToCanvasBackground } from "@/lib/design-engine/sync-engine";
import { useEditorKeyboardShortcuts } from "./useEditorKeyboardShortcuts";

export type CanvasEditorHandle = {
  exportPng: () => string | null;
  getPaperElement: () => HTMLElement | null;
  preparePage: (page: number) => Promise<void>;
  getPageCount: () => number;
  isReady: () => boolean;
};

interface CanvasEditorProps {
  embedded?: boolean;
  zoom?: number;
  onReady?: () => void;
}

function CanvasEditorInner(
  { embedded = false, zoom = 1, onReady }: CanvasEditorProps,
  ref: React.Ref<CanvasEditorHandle>
) {
  useEditorKeyboardShortcuts();
  const stageRef = useRef<Konva.Stage>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const elementsLayerRef = useRef<Konva.Layer>(null);
  const elements = useEditorStore((s) => s.elements);
  const selectedId = useEditorStore((s) => s.selectedId);
  const selectElement = useEditorStore((s) => s.selectElement);
  const clearAlignmentGuides = useEditorStore((s) => s.clearAlignmentGuides);
  const isExporting = useEditorStore((s) => s.isExporting);
  const activeTheme = useDesignStore((s) => s.activeTheme);
  const pageFill = themeToCanvasBackground(activeTheme);
  const gridFill =
    activeTheme.mode === "dark" ? "rgba(255,255,255,0.04)" : "#f4f4f5";

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (e.target === e.target.getStage()) {
        selectElement(null);
        clearAlignmentGuides();
      }
    },
    [selectElement, clearAlignmentGuides]
  );

  useImperativeHandle(ref, () => ({
    exportPng: () => {
      const stage = stageRef.current;
      if (!stage || !paperRef.current) return null;
      stage.batchDraw();
      return stage.toDataURL({ pixelRatio: 2 }) ?? null;
    },
    getPaperElement: () => paperRef.current,
    preparePage: async (page: number) => {
      useEditorStore.getState().setActivePage(page);
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
    },
    getPageCount: () => useEditorStore.getState().pageCount,
    isReady: () =>
      Boolean(
        paperRef.current &&
          stageRef.current &&
          paperRef.current.offsetWidth > 0 &&
          paperRef.current.offsetHeight > 0
      ),
  }));

  useEffect(() => {
    if (!onReady) return;

    let cancelled = false;
    let frame = 0;

    const notifyWhenReady = () => {
      if (cancelled) return;
      const paper = paperRef.current;
      const stage = stageRef.current;
      if (paper && stage && paper.offsetWidth > 0 && paper.offsetHeight > 0) {
        stage.batchDraw();
        onReady();
        return;
      }
      frame = requestAnimationFrame(notifyWhenReady);
    };

    frame = requestAnimationFrame(notifyWhenReady);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [onReady, elements.length]);

  const paper = (
    <div
      ref={paperRef}
      data-export-paper
      className={embedded ? "relative" : "relative shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow duration-300"}
      style={{
        width: A4_WIDTH,
        height: A4_HEIGHT,
        boxShadow:
          !embedded && activeTheme.effects.shadowDepth === "lift"
            ? "0 24px 48px rgba(0,0,0,0.18)"
            : undefined,
      }}
    >
      <Stage
          ref={stageRef}
          width={A4_WIDTH}
          height={A4_HEIGHT}
          onClick={handleStageClick}
          onTap={handleStageClick}
        >
          <Layer listening={false}>
            <Rect width={A4_WIDTH} height={A4_HEIGHT} fill={pageFill} />
            {Array.from({ length: Math.floor(A4_WIDTH / GRID_SIZE) }).map((_, i) => (
              <Rect
                key={`v-${i}`}
                x={i * GRID_SIZE}
                y={0}
                width={1}
                height={A4_HEIGHT}
                fill={gridFill}
              />
            ))}
            {Array.from({ length: Math.floor(A4_HEIGHT / GRID_SIZE) }).map((_, i) => (
              <Rect
                key={`h-${i}`}
                x={0}
                y={i * GRID_SIZE}
                width={A4_WIDTH}
                height={1}
                fill={gridFill}
              />
            ))}
            <Rect
              x={CANVAS_PADDING}
              y={CANVAS_PADDING}
              width={A4_WIDTH - CANVAS_PADDING * 2}
              height={A4_HEIGHT - CANVAS_PADDING * 2}
              stroke="#d4d4d8"
              strokeWidth={1}
              dash={[6, 6]}
            />
          </Layer>

          <Layer ref={elementsLayerRef}>
            <ElementLayer
              elements={elements}
              selectedId={selectedId}
              onSelect={selectElement}
              disableDrag={embedded}
            />
          </Layer>

          <Layer listening={false}>
            <AlignmentGuides />
          </Layer>

          {!embedded && (
            <Layer>
              <SelectionTransformer layerRef={elementsLayerRef} />
            </Layer>
          )}
        </Stage>
        {embedded && !isExporting && (
          <div className="pointer-events-none absolute inset-0 z-10">
            <StudioElementToolbar zoom={zoom} />
            <StudioResizeOverlay zoom={zoom} />
          </div>
        )}
        {!isExporting && <InlineTextEditor stageRef={stageRef} />}
    </div>
  );

  if (embedded) return paper;

  return (
    <div
      className="flex flex-1 items-start justify-center overflow-auto rounded-[14px] border border-black/[0.08] p-6 transition-colors duration-300"
      style={{
        background:
          activeTheme.mode === "dark"
            ? "linear-gradient(180deg, #18181b 0%, #09090b 100%)"
            : "rgba(244,244,245,0.8)",
      }}
    >
      {paper}
    </div>
  );
}

export const CanvasEditor = memo(forwardRef(CanvasEditorInner));
