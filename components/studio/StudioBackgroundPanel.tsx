"use client";

import { memo, useState } from "react";
import { useEditorStore } from "@/lib/editor-store";
import { STUDIO_BACKGROUND_PRESETS } from "@/lib/studio-backgrounds";
import { cn } from "@/lib/utils";

function PanelHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
      {children}
    </p>
  );
}

function StudioBackgroundPanelInner() {
  const canvasBackground = useEditorStore((s) => s.canvasBackground);
  const setCanvasBackground = useEditorStore((s) => s.setCanvasBackground);
  const [custom, setCustom] = useState(canvasBackground.startsWith("#") ? canvasBackground : "#ffffff");

  const categories = [
    { id: "solid" as const, label: "Solid" },
    { id: "gradient" as const, label: "Gradient" },
    { id: "professional" as const, label: "Pro" },
  ];
  const [cat, setCat] = useState<"all" | "solid" | "gradient" | "professional">("all");

  const filtered =
    cat === "all"
      ? STUDIO_BACKGROUND_PRESETS
      : STUDIO_BACKGROUND_PRESETS.filter((p) => p.category === cat);

  return (
    <div className="space-y-4">
      <PanelHeading>Page background</PanelHeading>
      <p className="text-xs leading-relaxed text-zinc-500">
        CV səhifəsinin arxa fon rəngi və ya gradienti. Şablon elementlərinin altında görünür.
      </p>

      <div
        className="h-24 w-full overflow-hidden rounded-xl border border-zinc-200 shadow-inner"
        style={{ background: canvasBackground }}
      />

      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setCat("all")}
          className={cn(
            "rounded-md px-2 py-1 text-[10px] font-medium",
            cat === "all" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"
          )}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCat(c.id)}
            className={cn(
              "rounded-md px-2 py-1 text-[10px] font-medium",
              cat === c.id ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {filtered.map((preset) => (
          <button
            key={preset.id}
            type="button"
            title={preset.label}
            onClick={() => setCanvasBackground(preset.value)}
            className={cn(
              "overflow-hidden rounded-xl border-2 transition hover:scale-[1.02]",
              canvasBackground === preset.value
                ? "border-zinc-900 ring-1 ring-zinc-900"
                : "border-zinc-200"
            )}
          >
            <div className="h-14 w-full" style={{ background: preset.value }} />
            <p className="truncate px-2 py-1.5 text-[10px] font-medium text-zinc-700">
              {preset.label}
            </p>
          </button>
        ))}
      </div>

      <PanelHeading>Custom color</PanelHeading>
      <div className="flex gap-2">
        <input
          type="color"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          className="h-10 w-14 cursor-pointer rounded-lg border border-zinc-200"
        />
        <button
          type="button"
          onClick={() => setCanvasBackground(custom)}
          className="flex-1 rounded-xl bg-zinc-900 py-2 text-xs font-semibold text-white hover:bg-zinc-800"
        >
          Apply color
        </button>
      </div>

      <label className="block text-xs text-zinc-600">
        Custom CSS (gradient)
        <input
          type="text"
          placeholder="linear-gradient(...)"
          className="mt-1.5 w-full rounded-lg border border-zinc-200 px-2 py-2 font-mono text-[10px]"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const v = (e.target as HTMLInputElement).value.trim();
              if (v) setCanvasBackground(v);
            }
          }}
        />
        <span className="mt-1 block text-[10px] text-zinc-400">Enter to apply</span>
      </label>
    </div>
  );
}

export const StudioBackgroundPanel = memo(StudioBackgroundPanelInner);
