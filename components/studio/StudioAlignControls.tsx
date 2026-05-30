"use client";

import { memo } from "react";
import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignStartVertical,
} from "lucide-react";
import { useEditorStore } from "@/lib/editor-store";
import { cn } from "@/lib/utils";

function StudioAlignControlsInner({ compact = false }: { compact?: boolean }) {
  const selectedId = useEditorStore((s) => s.selectedId);
  const alignSelectedHorizontally = useEditorStore((s) => s.alignSelectedHorizontally);
  const alignSelectedVertically = useEditorStore((s) => s.alignSelectedVertically);

  if (!selectedId) return null;

  const btn = (active: boolean) =>
    cn(
      "rounded-lg border text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-40",
      compact ? "p-1.5" : "flex-1 py-1.5",
      active && "border-zinc-900 bg-zinc-50"
    );

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium uppercase text-zinc-400">Align</p>
      <div className={cn("flex gap-1", compact ? "flex-wrap" : "")}>
        <button
          type="button"
          title="Align left"
          onClick={() => alignSelectedHorizontally("left")}
          className={btn(false)}
        >
          <AlignStartVertical className={cn("mx-auto", compact ? "h-3.5 w-3.5" : "h-3.5 w-3.5")} />
        </button>
        <button
          type="button"
          title="Align center horizontally"
          onClick={() => alignSelectedHorizontally("center")}
          className={btn(false)}
        >
          <AlignCenterVertical className="mx-auto h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          title="Align right"
          onClick={() => alignSelectedHorizontally("right")}
          className={btn(false)}
        >
          <AlignEndVertical className="mx-auto h-3.5 w-3.5" />
        </button>
        <span className={compact ? "hidden" : "w-1"} />
        <button
          type="button"
          title="Align top"
          onClick={() => alignSelectedVertically("top")}
          className={btn(false)}
        >
          <AlignStartHorizontal className="mx-auto h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          title="Align middle vertically"
          onClick={() => alignSelectedVertically("middle")}
          className={btn(false)}
        >
          <AlignCenterHorizontal className="mx-auto h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          title="Align bottom"
          onClick={() => alignSelectedVertically("bottom")}
          className={btn(false)}
        >
          <AlignEndHorizontal className="mx-auto h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export const StudioAlignControls = memo(StudioAlignControlsInner);
