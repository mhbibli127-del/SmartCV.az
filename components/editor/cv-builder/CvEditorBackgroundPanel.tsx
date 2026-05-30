"use client";

import { memo, useState } from "react";
import { useCvEditorStore } from "@/store/cv-editor-store";
import { STUDIO_BACKGROUND_PRESETS } from "@/lib/studio-backgrounds";
import { cn } from "@/lib/utils";

function PanelHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
      {children}
    </p>
  );
}

function CvEditorBackgroundPanelInner() {
  const background = useCvEditorStore((s) => s.background);
  const setBackground = useCvEditorStore((s) => s.setBackground);
  const [custom, setCustom] = useState(background.startsWith("#") ? background : "#ffffff");

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
    <div className="space-y-3">
      <div
        className="h-16 w-full overflow-hidden rounded-lg border border-zinc-200"
        style={{ background }}
      />

      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setCat("all")}
          className={cn(
            "rounded-md px-2 py-0.5 text-[10px] font-medium",
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
              "rounded-md px-2 py-0.5 text-[10px] font-medium",
              cat === c.id ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {filtered.map((preset) => (
          <button
            key={preset.id}
            type="button"
            title={preset.label}
            onClick={() => setBackground(preset.value)}
            className={cn(
              "overflow-hidden rounded-lg border-2 transition",
              background === preset.value ? "border-zinc-900" : "border-zinc-200"
            )}
          >
            <div className="h-10 w-full" style={{ background: preset.value }} />
            <p className="truncate px-1.5 py-1 text-[9px] font-medium text-zinc-700">
              {preset.label}
            </p>
          </button>
        ))}
      </div>

      <PanelHeading>Custom</PanelHeading>
      <div className="flex gap-2">
        <input
          type="color"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded border border-zinc-200"
        />
        <button
          type="button"
          onClick={() => setBackground(custom)}
          className="flex-1 rounded-lg bg-zinc-900 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
        >
          Apply
        </button>
      </div>
    </div>
  );
}

export const CvEditorBackgroundPanel = memo(CvEditorBackgroundPanelInner);
