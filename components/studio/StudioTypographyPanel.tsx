"use client";

import { memo, useMemo, useState } from "react";
import { useEditorStore } from "@/lib/editor-store";
import { useDesignStore } from "@/lib/design-store";
import { STUDIO_FONT_CATALOG, loadFontOption } from "@/lib/studio-fonts";
import { cn } from "@/lib/utils";
import type { EditorElement } from "@/types/cv-document";

function PanelHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
      {children}
    </p>
  );
}

function StudioTypographyPanelInner() {
  const [query, setQuery] = useState("");
  const selectedId = useEditorStore((s) => s.selectedId);
  const elements = useEditorStore((s) => s.elements);
  const updateElement = useEditorStore((s) => s.updateElement);
  const setFontPairing = useDesignStore((s) => s.setFontPairing);
  const applyThemeToCanvas = useDesignStore((s) => s.applyThemeToCanvas);
  const activeTheme = useDesignStore((s) => s.activeTheme);

  const selected = elements.find((e) => e.id === selectedId);
  const isTextLike = selected?.type === "text" || selected?.type === "section";

  const fontFamily =
    selected?.fontFamily ?? activeTheme.fonts.body ?? STUDIO_FONT_CATALOG[0].css;
  const fontSize = selected?.fontSize ?? 14;
  const lineHeight = selected?.lineHeight ?? 1.35;
  const letterSpacing = selected?.letterSpacing ?? 0;
  const fontWeight = selected?.fontWeight ?? "normal";

  const applyToSelected = (patch: Partial<EditorElement>) => {
    if (isTextLike && selected) {
      updateElement(selected.id, patch);
      return;
    }
    if (patch.fontFamily) {
      setFontPairing(String(patch.fontFamily), String(patch.fontFamily));
      applyThemeToCanvas();
    }
    const all = useEditorStore.getState().elements;
    for (const el of all) {
      if (el.type === "text" || el.type === "section") {
        updateElement(el.id, patch, false);
      }
    }
  };

  const filteredFonts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STUDIO_FONT_CATALOG;
    return STUDIO_FONT_CATALOG.filter((f) => f.label.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="space-y-4">
      <PanelHeading>Font family</PanelHeading>
      <input
        type="search"
        placeholder="Search fonts…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-9 w-full rounded-lg border border-zinc-200 px-3 text-xs focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
      />
      <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto pr-1">
        {filteredFonts.map((font) => (
          <button
            key={font.id}
            type="button"
            onClick={() => {
              loadFontOption(font);
              applyToSelected({ fontFamily: font.css });
            }}
            className={cn(
              "rounded-lg border px-2 py-2 text-left text-xs transition",
              fontFamily === font.css
                ? "border-zinc-900 bg-zinc-50 font-semibold"
                : "border-zinc-200 hover:border-zinc-300"
            )}
            style={{ fontFamily: font.css }}
          >
            {font.label}
          </button>
        ))}
      </div>

      <PanelHeading>Settings</PanelHeading>
      <label className="block text-xs text-zinc-600">
        Font size
        <input
          type="range"
          min={8}
          max={48}
          step={1}
          value={fontSize}
          onChange={(e) => applyToSelected({ fontSize: Number(e.target.value) })}
          className="mt-2 w-full accent-zinc-900"
        />
        <span className="mt-1 block text-zinc-400">{fontSize}px</span>
      </label>

      <label className="block text-xs text-zinc-600">
        Line height
        <input
          type="range"
          min={1}
          max={2.4}
          step={0.05}
          value={lineHeight}
          onChange={(e) => applyToSelected({ lineHeight: Number(e.target.value) })}
          className="mt-2 w-full accent-zinc-900"
        />
        <span className="mt-1 block text-zinc-400">{lineHeight.toFixed(2)}</span>
      </label>

      <label className="block text-xs text-zinc-600">
        Letter spacing
        <input
          type="range"
          min={-1}
          max={4}
          step={0.1}
          value={letterSpacing}
          onChange={(e) => applyToSelected({ letterSpacing: Number(e.target.value) })}
          className="mt-2 w-full accent-zinc-900"
        />
        <span className="mt-1 block text-zinc-400">{letterSpacing.toFixed(1)}px</span>
      </label>

      <label className="block text-xs text-zinc-600">
        Font weight
        <select
          value={fontWeight}
          onChange={(e) =>
            applyToSelected({ fontWeight: e.target.value as "normal" | "bold" })
          }
          className="mt-1.5 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
        >
          <option value="normal">Regular</option>
          <option value="bold">Bold</option>
        </select>
      </label>

      <div
        className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-4"
        style={{ fontFamily, fontSize, lineHeight, letterSpacing }}
      >
        <p className={fontWeight === "bold" ? "font-bold" : ""}>
          The quick brown fox jumps over the lazy dog.
        </p>
      </div>

      {!isTextLike && (
        <p className="text-xs text-zinc-400">
          Select a text block on canvas for element-level typography.
        </p>
      )}
    </div>
  );
}

export const StudioTypographyPanel = memo(StudioTypographyPanelInner);
