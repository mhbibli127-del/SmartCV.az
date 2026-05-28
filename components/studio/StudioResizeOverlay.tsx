"use client";

import { memo } from "react";
import { Rnd } from "react-rnd";
import { useEditorStore } from "@/lib/editor-store";
import {
  GRID_SIZE,
  MIN_ELEMENT_HEIGHT,
  MIN_ELEMENT_WIDTH,
} from "@/lib/layout-engine";

interface StudioResizeOverlayProps {
  zoom?: number;
}

function StudioResizeOverlayInner({ zoom = 1 }: StudioResizeOverlayProps) {
  const selectedId = useEditorStore((s) => s.selectedId);
  const editingId = useEditorStore((s) => s.editingId);
  const elements = useEditorStore((s) => s.elements);
  const snapEnabled = useEditorStore((s) => s.snapEnabled);
  const resizeElement = useEditorStore((s) => s.resizeElement);
  const commitElementMove = useEditorStore((s) => s.commitElementMove);

  const selected = elements.find((e) => e.id === selectedId);
  if (!selected || selected.locked || editingId === selected.id) return null;

  const grid = snapEnabled ? GRID_SIZE : 1;

  return (
    <Rnd
      key={selected.id}
      position={{ x: selected.x, y: selected.y }}
      size={{ width: selected.width, height: selected.height }}
      scale={zoom}
      minWidth={MIN_ELEMENT_WIDTH}
      minHeight={MIN_ELEMENT_HEIGHT}
      bounds="parent"
      dragGrid={[grid, grid]}
      resizeGrid={[grid, grid]}
      onDragStop={(_e, data) => {
        commitElementMove(selected.id, data.x, data.y);
      }}
      onResizeStop={(_e, _dir, ref, _delta, position) => {
        resizeElement(selected.id, {
          width: parseInt(ref.style.width, 10),
          height: parseInt(ref.style.height, 10),
          x: position.x,
          y: position.y,
        });
      }}
      className="pointer-events-auto z-20"
      style={{ zIndex: selected.zIndex + 500 }}
    >
      <div className="h-full w-full rounded-sm border-2 border-zinc-900 bg-transparent shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]" />
    </Rnd>
  );
}

export const StudioResizeOverlay = memo(StudioResizeOverlayInner);
