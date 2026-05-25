"use client";

import { memo, useCallback, useRef } from "react";
import { Stage, Layer, Rect } from "react-konva";
import type Konva from "konva";
import { ElementLayer } from "./ElementLayer";
import { useEditorStore } from "@/lib/editor-store";
import { A4_HEIGHT, A4_WIDTH, CANVAS_PADDING, GRID_SIZE } from "@/lib/layout-engine";
import { useEditorKeyboardShortcuts } from "./useEditorKeyboardShortcuts";

function CanvasEditorInner() {
  useEditorKeyboardShortcuts();
  const stageRef = useRef<Konva.Stage>(null);
  const elements = useEditorStore((s) => s.elements);
  const selectedId = useEditorStore((s) => s.selectedId);
  const selectElement = useEditorStore((s) => s.selectElement);
  const updateElement = useEditorStore((s) => s.updateElement);

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (e.target === e.target.getStage()) selectElement(null);
    },
    [selectElement]
  );

  return (
    <div className="flex flex-1 items-start justify-center overflow-auto rounded-[14px] border border-black/[0.08] bg-zinc-100/80 p-6">
      <div
        className="shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
        style={{ width: A4_WIDTH, height: A4_HEIGHT }}
      >
        <Stage
          ref={stageRef}
          width={A4_WIDTH}
          height={A4_HEIGHT}
          onClick={handleStageClick}
          onTap={handleStageClick}
        >
          <Layer>
            <Rect width={A4_WIDTH} height={A4_HEIGHT} fill="#ffffff" />
            {Array.from({ length: Math.floor(A4_WIDTH / GRID_SIZE) }).map((_, i) => (
              <Rect
                key={`v-${i}`}
                x={i * GRID_SIZE}
                y={0}
                width={1}
                height={A4_HEIGHT}
                fill="#f4f4f5"
                listening={false}
              />
            ))}
            {Array.from({ length: Math.floor(A4_HEIGHT / GRID_SIZE) }).map((_, i) => (
              <Rect
                key={`h-${i}`}
                x={0}
                y={i * GRID_SIZE}
                width={A4_WIDTH}
                height={1}
                fill="#f4f4f5"
                listening={false}
              />
            ))}
            <Rect
              x={CANVAS_PADDING}
              y={CANVAS_PADDING}
              width={A4_WIDTH - CANVAS_PADDING * 2}
              height={A4_HEIGHT - CANVAS_PADDING * 2}
              stroke="#f4f4f5"
              strokeWidth={1}
              dash={[6, 6]}
              listening={false}
            />
            <ElementLayer
              elements={elements}
              selectedId={selectedId}
              onSelect={selectElement}
              onChange={updateElement}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

export const CanvasEditor = memo(CanvasEditorInner);
