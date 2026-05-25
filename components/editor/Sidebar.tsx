"use client";

import { memo } from "react";
import { useEditorStore } from "@/lib/editor-store";
import { Input } from "@/components/ui/input";

function SidebarInner() {
  const selectedId = useEditorStore((s) => s.selectedId);
  const elements = useEditorStore((s) => s.elements);
  const updateElement = useEditorStore((s) => s.updateElement);

  const selected = elements.find((e) => e.id === selectedId);

  if (!selected) {
    return (
      <aside className="w-64 shrink-0 rounded-[14px] border border-black/[0.08] bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-zinc-900">Properties</p>
        <p className="mt-2 text-xs text-zinc-500">
          Select an element on the canvas to edit position, text, and style.
        </p>
      </aside>
    );
  }

  return (
    <aside className="w-64 shrink-0 space-y-4 rounded-[14px] border border-black/[0.08] bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-zinc-900">Properties</p>
      <p className="text-xs capitalize text-zinc-400">{selected.type} · z{selected.zIndex}</p>

      {(selected.type === "text" || selected.type === "section") && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-600">
            {selected.type === "section" ? "Content" : "Text"}
          </label>
          <textarea
            className="min-h-[80px] w-full rounded-[12px] border border-black/[0.08] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
            value={selected.type === "section" ? selected.content ?? "" : selected.text ?? ""}
            onChange={(e) =>
              updateElement(
                selected.id,
                selected.type === "section"
                  ? { content: e.target.value }
                  : { text: e.target.value }
              )
            }
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-600">X</label>
          <Input
            type="number"
            value={Math.round(selected.x)}
            onChange={(e) => updateElement(selected.id, { x: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-600">Y</label>
          <Input
            type="number"
            value={Math.round(selected.y)}
            onChange={(e) => updateElement(selected.id, { y: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-600">Width</label>
          <Input
            type="number"
            value={Math.round(selected.width)}
            onChange={(e) => updateElement(selected.id, { width: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-600">Height</label>
          <Input
            type="number"
            value={Math.round(selected.height)}
            onChange={(e) => updateElement(selected.id, { height: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-600">Font size</label>
        <Input
          type="number"
          value={selected.fontSize ?? 13}
          onChange={(e) => updateElement(selected.id, { fontSize: Number(e.target.value) })}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-600">Color</label>
        <Input
          type="color"
          value={selected.fill ?? "#18181b"}
          onChange={(e) => updateElement(selected.id, { fill: e.target.value })}
          className="h-10 p-1"
        />
      </div>
    </aside>
  );
}

export const Sidebar = memo(SidebarInner);
