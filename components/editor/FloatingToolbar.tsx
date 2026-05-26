"use client";

import { memo } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Copy,
  Lock,
  Trash2,
  Unlock,
} from "lucide-react";
import { useEditorStore } from "@/lib/editor-store";
import { cn } from "@/lib/utils";

interface FloatingToolbarProps {
  className?: string;
}

function FloatingToolbarInner({ className }: FloatingToolbarProps) {
  const selectedId = useEditorStore((s) => s.selectedId);
  const elements = useEditorStore((s) => s.elements);
  const removeElement = useEditorStore((s) => s.removeElement);
  const duplicateElement = useEditorStore((s) => s.duplicateElement);
  const toggleElementLock = useEditorStore((s) => s.toggleElementLock);
  const updateElement = useEditorStore((s) => s.updateElement);

  const selected = elements.find((e) => e.id === selectedId);
  if (!selectedId || !selected) return null;

  const align = (mode: "left" | "center" | "right") => {
    const canvasW = 794;
    const w = selected.width;
    let x = selected.x;
    if (mode === "left") x = 40;
    if (mode === "center") x = (canvasW - w) / 2;
    if (mode === "right") x = canvasW - w - 40;
    updateElement(selectedId, { x });
  };

  return (
    <div
      className={cn(
        "pointer-events-auto absolute left-1/2 top-4 z-30 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-black/[0.08] bg-white/95 px-2 py-1.5 shadow-lg backdrop-blur-sm",
        className
      )}
    >
      <button type="button" title="Align left" className="rounded-lg p-1.5 hover:bg-zinc-100" onClick={() => align("left")}>
        <AlignLeft className="h-3.5 w-3.5" />
      </button>
      <button type="button" title="Align center" className="rounded-lg p-1.5 hover:bg-zinc-100" onClick={() => align("center")}>
        <AlignCenter className="h-3.5 w-3.5" />
      </button>
      <button type="button" title="Align right" className="rounded-lg p-1.5 hover:bg-zinc-100" onClick={() => align("right")}>
        <AlignRight className="h-3.5 w-3.5" />
      </button>
      <div className="mx-1 h-4 w-px bg-zinc-200" />
      <button type="button" title="Duplicate" className="rounded-lg p-1.5 hover:bg-zinc-100" onClick={() => duplicateElement(selectedId)}>
        <Copy className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        title={selected.locked ? "Unlock" : "Lock"}
        className="rounded-lg p-1.5 hover:bg-zinc-100"
        onClick={() => toggleElementLock(selectedId)}
      >
        {selected.locked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
      </button>
      <button type="button" title="Delete" className="rounded-lg p-1.5 hover:bg-red-50" onClick={() => removeElement(selectedId)}>
        <Trash2 className="h-3.5 w-3.5 text-red-500" />
      </button>
    </div>
  );
}

export const FloatingToolbar = memo(FloatingToolbarInner);
