"use client";

import { memo, useMemo, useState } from "react";
import { useEditorStore } from "@/lib/editor-store";
import { useDesignStore } from "@/lib/design-store";
import {
  STUDIO_FONT_CATALOG,
  loadFontOption,
  loadFontByName,
  resolveStudioFontCss,
  type StudioFontOption,
} from "@/lib/studio-fonts";
import { FONT_PAIRINGS } from "@/lib/design-engine/themes";
import { StudioTextStyleControls } from "@/components/studio/StudioTextStyleControls";
import { cn } from "@/lib/utils";
import type { EditorElement } from "@/types/cv-document";

const FONT_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "sans", label: "Sans" },
  { id: "serif", label: "Serif" },
  { id: "mono", label: "Mono" },
  { id: "display", label: "Display" },
] as const;

function PanelHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
      {children}
    </p>
  );
}

function StudioTypographyPanelInner() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof FONT_CATEGORIES)[number]["id"]>("all");
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
  const fontStyle = selected?.fontStyle ?? "normal";
  const textAlign = selected?.textAlign ?? "left";

  const applyToSelected = (patch: Partial<EditorElement>, recordHistory = true) => {
    if (isTextLike && selected) {
      updateElement(selected.id, patch, recordHistory);
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

  const applyFontPairing = (heading: string, body: string) => {
    loadFontByName(heading);
    loadFontByName(body);
    setFontPairing(heading, body);
    applyThemeToCanvas();
  };

  const filteredFonts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return STUDIO_FONT_CATALOG.filter((f) => {
      const matchesQuery =
        !q || f.label.toLowerCase().includes(q) || f.css.toLowerCase().includes(q);
      const matchesCategory = category === "all" || f.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [query, category]);

  return (
    <div className="space-y-4">
      <PanelHeading>Font pairings</PanelHeading>
      <div className="grid grid-cols-2 gap-2">
        {FONT_PAIRINGS.map((pair) => (
          <button
            key={pair.id}
            type="button"
            onClick={() => applyFontPairing(pair.heading, pair.body)}
            className="rounded-lg border border-zinc-200 px-2 py-2 text-left transition hover:border-zinc-300 hover:bg-zinc-50"
          >
            <span className="block text-[10px] font-semibold text-zinc-800">{pair.label}</span>
            <span
              className="mt-0.5 block truncate text-[10px] text-zinc-500"
              style={{ fontFamily: resolveStudioFontCss(pair.heading) }}
            >
              {pair.heading}
            </span>
            <span
              className="block truncate text-[10px] text-zinc-400"
              style={{ fontFamily: resolveStudioFontCss(pair.body) }}
            >
              {pair.body}
            </span>
          </button>
        ))}
      </div>

      <PanelHeading>Font family</PanelHeading>
      <input
        type="search"
        placeholder="Search fonts…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-9 w-full rounded-lg border border-zinc-200 px-3 text-xs focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
      />
      <div className="flex flex-wrap gap-1">
        {FONT_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategory(cat.id)}
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition",
              category === cat.id
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="grid max-h-52 grid-cols-2 gap-2 overflow-y-auto pr-1">
        {filteredFonts.map((font: StudioFontOption) => (
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

      <StudioTextStyleControls
        textAlign={textAlign}
        fontWeight={fontWeight}
        fontStyle={fontStyle}
        onTextAlign={(align) => applyToSelected({ textAlign: align })}
        onFontWeight={(weight) => applyToSelected({ fontWeight: weight })}
        onFontStyle={(style) => applyToSelected({ fontStyle: style })}
      />

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

      <div
        className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-4"
        style={{
          fontFamily,
          fontSize,
          lineHeight,
          letterSpacing,
          textAlign,
          fontStyle: fontStyle === "italic" ? "italic" : "normal",
          fontWeight: fontWeight === "bold" ? 700 : 400,
        }}
      >
        <p>The quick brown fox jumps over the lazy dog.</p>
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
