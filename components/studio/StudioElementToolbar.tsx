"use client";

import { memo } from "react";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Layers,
  Trash2,
} from "lucide-react";
import { useEditorStore } from "@/lib/editor-store";
import { useDesignStore } from "@/lib/design-store";
import { A4_WIDTH } from "@/lib/layout-engine";

interface StudioElementToolbarProps {
  zoom?: number;
}

function StudioElementToolbarInner({ zoom = 1 }: StudioElementToolbarProps) {
  const atsSafeMode = useDesignStore((s) => s.atsSafeMode);
  const selectedId = useEditorStore((s) => s.selectedId);
  const editingId = useEditorStore((s) => s.editingId);
  const elements = useEditorStore((s) => s.elements);
  const duplicateElement = useEditorStore((s) => s.duplicateElement);
  const removeElement = useEditorStore((s) => s.removeElement);
  const bringForward = useEditorStore((s) => s.bringForward);
  const sendBackward = useEditorStore((s) => s.sendBackward);
  const commitElementMove = useEditorStore((s) => s.commitElementMove);

  const selected = elements.find((e) => e.id === selectedId);
  if (!selected || selected.locked || editingId === selected.id || atsSafeMode) return null;

  const left = Math.min(Math.max(selected.x * zoom, 8), A4_WIDTH * zoom - 180);
  const top = Math.max(selected.y * zoom - 40, 8);

  const nudge = (dx: number, dy: number) => {
    commitElementMove(selected.id, selected.x + dx, selected.y + dy);
  };

  return (
    <div
      className="pointer-events-auto absolute z-30 flex items-center gap-0.5 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg"
      style={{ left, top }}
    >
      <button
        type="button"
        title="Duplicate"
        onClick={() => duplicateElement(selected.id)}
        className="rounded p-1.5 text-zinc-600 hover:bg-zinc-100"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        title="Move up"
        onClick={() => nudge(0, -8)}
        className="rounded p-1.5 text-zinc-600 hover:bg-zinc-100"
      >
        <ArrowUp className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        title="Move down"
        onClick={() => nudge(0, 8)}
        className="rounded p-1.5 text-zinc-600 hover:bg-zinc-100"
      >
        <ArrowDown className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        title="Bring forward"
        onClick={() => bringForward(selected.id)}
        className="rounded p-1.5 text-zinc-600 hover:bg-zinc-100"
      >
        <Layers className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        title="Send backward"
        onClick={() => sendBackward(selected.id)}
        className="rounded p-1.5 text-zinc-600 hover:bg-zinc-100"
      >
        <Layers className="h-3.5 w-3.5 rotate-180" />
      </button>
      <button
        type="button"
        title="Delete"
        onClick={() => removeElement(selected.id)}
        className="rounded p-1.5 text-red-500 hover:bg-red-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export const StudioElementToolbar = memo(StudioElementToolbarInner);
