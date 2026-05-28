"use client";

import { memo, useEffect, useState } from "react";
import { useDesignStore } from "@/lib/design-store";
import { useEditorStore } from "@/lib/editor-store";
import { PALETTES } from "@/lib/design-engine/themes";
import {
  ACCENT_SWATCHES,
  pushRecentColor,
  readRecentColors,
  THEME_COLOR_PRESETS,
} from "@/lib/studio-colors";
import { cn } from "@/lib/utils";

function PanelHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
      {children}
    </p>
  );
}

function StudioColorsPanelInner() {
  const setPaletteAccent = useDesignStore((s) => s.setPaletteAccent);
  const applyThemeToCanvas = useDesignStore((s) => s.applyThemeToCanvas);
  const activeTheme = useDesignStore((s) => s.activeTheme);
  const atsSafeMode = useDesignStore((s) => s.atsSafeMode);
  const selectedId = useEditorStore((s) => s.selectedId);
  const updateElement = useEditorStore((s) => s.updateElement);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    setRecent(readRecentColors());
  }, []);

  const applyColor = (color: string) => {
    setPaletteAccent(color);
    applyThemeToCanvas();
    const next = pushRecentColor(color);
    setRecent(next);
    if (selectedId) {
      updateElement(selectedId, { fill: color });
    }
  };

  return (
    <div className="space-y-4">
      <PanelHeading>Theme presets</PanelHeading>
      <div className="grid grid-cols-2 gap-2">
        {THEME_COLOR_PRESETS.filter((p) => !atsSafeMode || !p.gradient).map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => applyColor(preset.accent)}
            className={cn(
              "overflow-hidden rounded-xl border text-left transition hover:scale-[1.02]",
              activeTheme.palette.accent === preset.accent
                ? "border-zinc-900 ring-1 ring-zinc-900"
                : "border-zinc-200"
            )}
          >
            <div
              className="h-10 w-full"
              style={{
                background: preset.gradient ?? preset.accent,
              }}
            />
            <p className="px-2 py-1.5 text-[10px] font-medium text-zinc-700">{preset.name}</p>
          </button>
        ))}
      </div>

      {recent.length > 0 && (
        <>
          <PanelHeading>Recent colors</PanelHeading>
          <div className="flex flex-wrap gap-2">
            {recent.map((color) => (
              <button
                key={color}
                type="button"
                title={color}
                onClick={() => applyColor(color)}
                className="h-8 w-8 rounded-full ring-2 ring-zinc-100 transition hover:scale-105"
                style={{ background: color }}
              />
            ))}
          </div>
        </>
      )}

      <PanelHeading>Accent swatches</PanelHeading>
      <div className="flex flex-wrap gap-2">
        {ACCENT_SWATCHES.map((color) => (
          <button
            key={color}
            type="button"
            title={color}
            onClick={() => applyColor(color)}
            className={cn(
              "h-9 w-9 rounded-full ring-2 transition hover:scale-105",
              activeTheme.palette.accent === color ? "ring-zinc-900" : "ring-zinc-100"
            )}
            style={{ background: color }}
          />
        ))}
      </div>

      <PanelHeading>Palette library</PanelHeading>
      <div className="flex flex-wrap gap-2">
        {PALETTES.filter((p) => !atsSafeMode || !p.gradient).map((p) => (
          <button
            key={p.id}
            type="button"
            title={p.name}
            onClick={() => applyColor(p.accent)}
            className="h-9 w-9 rounded-full ring-2 ring-zinc-100 transition hover:scale-105"
            style={{
              background: p.gradient ?? p.accent,
            }}
          />
        ))}
      </div>

      <div
        className="rounded-xl border border-zinc-200 p-4"
        style={{ borderColor: activeTheme.palette.accent }}
      >
        <p className="text-xs text-zinc-500">Current accent</p>
        <p className="mt-1 text-sm font-semibold" style={{ color: activeTheme.palette.accent }}>
          {activeTheme.palette.accent}
        </p>
      </div>
    </div>
  );
}

export const StudioColorsPanel = memo(StudioColorsPanelInner);
