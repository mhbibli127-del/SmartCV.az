"use client";

import { memo } from "react";
import { Copy, Lock, Trash2, Unlock } from "lucide-react";
import { useEditorStore } from "@/lib/editor-store";
import { Input } from "@/components/ui/input";
import { StudioImageControls } from "@/components/studio/StudioImageControls";
import { StudioSectionStylePanel } from "@/components/studio/StudioSectionStylePanel";

function PropertiesInspectorInner({ cvId }: { cvId?: string | null }) {
  const selectedId = useEditorStore((s) => s.selectedId);
  const elements = useEditorStore((s) => s.elements);
  const updateElement = useEditorStore((s) => s.updateElement);
  const removeElement = useEditorStore((s) => s.removeElement);
  const duplicateElement = useEditorStore((s) => s.duplicateElement);
  const toggleElementLock = useEditorStore((s) => s.toggleElementLock);

  const selected = elements.find((e) => e.id === selectedId);

  if (!selected) {
    return (
      <aside className="flex h-full w-[260px] shrink-0 flex-col border-l border-zinc-200 bg-zinc-50/50 p-6">
        <p className="text-sm font-medium text-zinc-900">Properties</p>
        <p className="mt-2 text-xs leading-relaxed text-zinc-500">
          Select an element on the canvas to edit its content, size, and position.
        </p>
      </aside>
    );
  }

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-l border-zinc-200 bg-white">
      <div className="border-b border-zinc-100 px-4 py-3">
        <p className="text-sm font-semibold capitalize text-zinc-900">{selected.type}</p>
        <p className="text-xs text-zinc-400">Element properties</p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {(selected.type === "text" || selected.type === "section") && (
          <div>
            <label className="text-[11px] font-medium uppercase text-zinc-400">Content</label>
            <textarea
              className="mt-1.5 min-h-[100px] w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
              value={
                selected.type === "section" ? selected.content ?? "" : selected.text ?? ""
              }
              onChange={(e) => {
                const patch =
                  selected.type === "section"
                    ? { content: e.target.value }
                    : { text: e.target.value };
                updateElement(selected.id, patch, false);
              }}
              onBlur={(e) => {
                const patch =
                  selected.type === "section"
                    ? { content: e.target.value }
                    : { text: e.target.value };
                updateElement(selected.id, patch, true);
              }}
            />
          </div>
        )}

        {selected.type === "section" && (
          <div>
            <label className="text-[11px] font-medium uppercase text-zinc-400">
              Section style
            </label>
            <div className="mt-2">
              <StudioSectionStylePanel />
            </div>
          </div>
        )}

        {selected.type === "image" && (
          <StudioImageControls cvId={cvId} compact />
        )}

        {(selected.type === "text" || selected.type === "section") && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-medium uppercase text-zinc-400">Size</label>
              <Input
                type="number"
                value={selected.fontSize ?? 14}
                onChange={(e) =>
                  updateElement(selected.id, { fontSize: Number(e.target.value) })
                }
                className="mt-1.5 h-9 text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium uppercase text-zinc-400">Color</label>
              <input
                type="color"
                value={selected.fill ?? "#18181b"}
                onChange={(e) => updateElement(selected.id, { fill: e.target.value })}
                className="mt-1.5 h-9 w-full cursor-pointer rounded-lg border border-zinc-200"
              />
            </div>
          </div>
        )}

        <div>
          <label className="text-[11px] font-medium uppercase text-zinc-400">Position & size</label>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {(["x", "y", "width", "height"] as const).map((key) => (
              <div key={key}>
                <span className="text-[10px] uppercase text-zinc-400">{key}</span>
                <Input
                  type="number"
                  value={Math.round(selected[key])}
                  onChange={(e) =>
                    updateElement(selected.id, { [key]: Number(e.target.value) })
                  }
                  className="mt-0.5 h-8 text-xs"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => duplicateElement(selected.id)}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-zinc-200 py-2 text-xs hover:bg-zinc-50"
          >
            <Copy className="h-3.5 w-3.5" />
            Duplicate
          </button>
          <button
            type="button"
            onClick={() => toggleElementLock(selected.id)}
            className="rounded-lg border border-zinc-200 p-2 hover:bg-zinc-50"
          >
            {selected.locked ? (
              <Unlock className="h-3.5 w-3.5" />
            ) : (
              <Lock className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => removeElement(selected.id)}
            className="rounded-lg border border-red-100 p-2 text-red-500 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export const PropertiesInspector = memo(PropertiesInspectorInner);
