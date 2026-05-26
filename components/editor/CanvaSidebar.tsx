"use client";

import { memo, useMemo, useState } from "react";
import Link from "next/link";
import {
  Palette,
  Shapes,
  LayoutGrid,
  Layers,
  Lock,
  Unlock,
  Copy,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { useEditorStore, type SidebarTab } from "@/lib/editor-store";
import { useDesignStore } from "@/lib/design-store";
import { FONT_PAIRINGS, PALETTES } from "@/lib/design-engine/themes";
import { Input } from "@/components/ui/input";
import MediaUploadDropzone from "@/components/media/MediaUploadDropzone";
import { AIImagePanel } from "@/components/ai/AIImagePanel";
import type { CVSectionType } from "@/types/cv-document";
import { cn } from "@/lib/utils";

const TABS: { id: SidebarTab; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { id: "elements", icon: Shapes, label: "Elements" },
  { id: "design", icon: Palette, label: "Design" },
  { id: "layout", icon: LayoutGrid, label: "Layout" },
  { id: "layers", icon: Layers, label: "Layers" },
];

const SECTION_TYPES: { type: CVSectionType; label: string }[] = [
  { type: "summary", label: "Summary" },
  { type: "experience", label: "Experience" },
  { type: "education", label: "Education" },
  { type: "skills", label: "Skills" },
  { type: "projects", label: "Projects" },
  { type: "languages", label: "Languages" },
];

function PropertiesBlock() {
  const selectedId = useEditorStore((s) => s.selectedId);
  const elements = useEditorStore((s) => s.elements);
  const updateElement = useEditorStore((s) => s.updateElement);
  const duplicateElement = useEditorStore((s) => s.duplicateElement);
  const toggleElementLock = useEditorStore((s) => s.toggleElementLock);

  const selected = elements.find((e) => e.id === selectedId);
  if (!selected) return null;

  const alignX = (mode: "left" | "center" | "right") => {
    const pageW = 794 - 48 * 2;
    if (mode === "left") updateElement(selected.id, { x: 48 });
    if (mode === "center") updateElement(selected.id, { x: 48 + (pageW - selected.width) / 2 });
    if (mode === "right") updateElement(selected.id, { x: 794 - 48 - selected.width });
  };

  return (
    <div className="space-y-3 border-t border-black/[0.06] pt-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Selected</p>
        <div className="flex gap-1">
          <button
            type="button"
            title="Duplicate"
            onClick={() => duplicateElement(selected.id)}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title={selected.locked ? "Unlock" : "Lock"}
            onClick={() => toggleElementLock(selected.id)}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100"
          >
            {selected.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {(selected.type === "text" || selected.type === "section") && (
        <textarea
          className="min-h-[72px] w-full rounded-xl border border-black/[0.08] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          value={selected.type === "section" ? selected.content ?? "" : selected.text ?? ""}
          onChange={(e) =>
            updateElement(
              selected.id,
              selected.type === "section" ? { content: e.target.value } : { text: e.target.value }
            )
          }
        />
      )}

      <div className="flex gap-1">
        <button type="button" onClick={() => alignX("left")} className="flex-1 rounded-lg border py-1.5 text-zinc-500 hover:bg-zinc-50">
          <AlignLeft className="mx-auto h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={() => alignX("center")} className="flex-1 rounded-lg border py-1.5 text-zinc-500 hover:bg-zinc-50">
          <AlignCenter className="mx-auto h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={() => alignX("right")} className="flex-1 rounded-lg border py-1.5 text-zinc-500 hover:bg-zinc-50">
          <AlignRight className="mx-auto h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {(["x", "y", "width", "height"] as const).map((key) => (
          <div key={key}>
            <label className="text-[10px] uppercase text-zinc-400">{key}</label>
            <Input
              type="number"
              value={Math.round(selected[key])}
              onChange={(e) => updateElement(selected.id, { [key]: Number(e.target.value) })}
              className="h-8 text-xs"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function CanvaSidebarInner({ cvId }: { cvId?: string | null }) {
  const sidebarTab = useEditorStore((s) => s.sidebarTab);
  const setSidebarTab = useEditorStore((s) => s.setSidebarTab);
  const addTextElement = useEditorStore((s) => s.addTextElement);
  const addSectionBlock = useEditorStore((s) => s.addSectionBlock);
  const addShapeElement = useEditorStore((s) => s.addShapeElement);
  const addImageElement = useEditorStore((s) => s.addImageElement);
  const addDividerElement = useEditorStore((s) => s.addDividerElement);
  const updateElement = useEditorStore((s) => s.updateElement);
  const elements = useEditorStore((s) => s.elements);
  const selectedId = useEditorStore((s) => s.selectedId);
  const selectElement = useEditorStore((s) => s.selectElement);
  const bringForward = useEditorStore((s) => s.bringForward);
  const sendBackward = useEditorStore((s) => s.sendBackward);
  const activeTheme = useDesignStore((s) => s.activeTheme);
  const setPaletteAccent = useDesignStore((s) => s.setPaletteAccent);
  const setFontPairing = useDesignStore((s) => s.setFontPairing);
  const setSpacing = useDesignStore((s) => s.setSpacing);
  const applyThemeToCanvas = useDesignStore((s) => s.applyThemeToCanvas);
  const liveAtsScore = useDesignStore((s) => s.liveAtsScore);

  const [imageUrl, setImageUrl] = useState("");

  const sortedLayers = useMemo(
    () => [...elements].sort((a, b) => b.zIndex - a.zIndex),
    [elements]
  );

  return (
    <aside className="flex h-[calc(100vh-280px)] min-h-[520px] w-[340px] shrink-0 overflow-hidden rounded-[14px] border border-black/[0.08] bg-white shadow-sm">
      <nav className="flex w-12 flex-col border-r border-black/[0.06] bg-zinc-50/80 py-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            title={tab.label}
            onClick={() => setSidebarTab(tab.id)}
            className={cn(
              "mx-1.5 mb-1 flex h-10 items-center justify-center rounded-xl transition",
              sidebarTab === tab.id
                ? "bg-zinc-900 text-white shadow-sm"
                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
            )}
          >
            <tab.icon className="h-4 w-4" />
          </button>
        ))}
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-black/[0.06] px-4 py-3">
          <p className="text-sm font-semibold text-zinc-900">
            {TABS.find((t) => t.id === sidebarTab)?.label}
          </p>
          <p className="text-[11px] text-zinc-400">Realtime · ATS {liveAtsScore}%</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {sidebarTab === "design" && (
            <div className="space-y-4">
              <Link
                href="/dashboard/templates"
                className="block rounded-xl border border-black/[0.08] bg-zinc-50 px-3 py-2 text-center text-xs font-medium text-zinc-700 hover:bg-zinc-100"
              >
                Browse all templates →
              </Link>
              <div className="flex flex-wrap gap-2">
                {PALETTES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    title={p.name}
                    onClick={() => setPaletteAccent(p.accent)}
                    className="h-9 w-9 rounded-full ring-2 ring-black/[0.06] transition hover:scale-110"
                    style={{ background: p.accent }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={activeTheme.palette.accent}
                onChange={(e) => setPaletteAccent(e.target.value)}
                className="h-10 w-full cursor-pointer rounded-xl border border-black/[0.08]"
              />
              <select
                value={activeTheme.fonts.id}
                onChange={(e) => {
                  const pair = FONT_PAIRINGS.find((f) => f.id === e.target.value);
                  if (pair) setFontPairing(pair.heading, pair.body);
                }}
                className="w-full rounded-xl border border-black/[0.08] px-3 py-2 text-sm"
              >
                {FONT_PAIRINGS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={applyThemeToCanvas}
                className="w-full rounded-xl bg-zinc-900 py-2 text-xs font-semibold text-white"
              >
                Apply to canvas
              </button>
            </div>
          )}

          {sidebarTab === "elements" && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => addTextElement()}
                className="w-full rounded-xl border border-black/[0.08] py-2.5 text-sm font-medium hover:bg-zinc-50"
              >
                + Text block
              </button>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                Shapes & media
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => addShapeElement("rect")} className="rounded-lg border py-2 text-xs hover:bg-zinc-50">Rect</button>
                <button type="button" onClick={() => addShapeElement("circle")} className="rounded-lg border py-2 text-xs hover:bg-zinc-50">Circle</button>
                <button type="button" onClick={() => addDividerElement()} className="rounded-lg border py-2 text-xs hover:bg-zinc-50">Line</button>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Image URL…"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="h-8 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    addImageElement(imageUrl.trim() || undefined);
                    setImageUrl("");
                  }}
                  className="shrink-0 rounded-lg bg-zinc-900 px-3 text-xs text-white"
                >
                  Add
                </button>
              </div>
              <MediaUploadDropzone
                context="resume"
                compact
                label="Drop resume image"
                hint="PNG, JPG, WebP — max 5MB"
                onUploaded={(media) => addImageElement(media.optimizedUrl || media.secureUrl)}
              />
              <AIImagePanel cvId={cvId} />
              {selectedId && elements.find((e) => e.id === selectedId)?.type === "image" && (
                <Input
                  placeholder="Update image URL"
                  value={elements.find((e) => e.id === selectedId)?.src ?? ""}
                  onChange={(e) => updateElement(selectedId, { src: e.target.value })}
                  className="h-8 text-xs"
                />
              )}
              <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                CV Sections
              </p>
              <div className="grid grid-cols-2 gap-2">
                {SECTION_TYPES.map((s) => (
                  <button
                    key={s.type}
                    type="button"
                    onClick={() => addSectionBlock(s.type)}
                    className="rounded-xl border border-black/[0.06] px-2 py-2 text-xs font-medium hover:border-violet-400/40 hover:bg-violet-50/50"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <PropertiesBlock />
            </div>
          )}

          {sidebarTab === "layout" && (
            <div className="space-y-4">
              <label className="block text-xs text-zinc-500">
                Spacing · {activeTheme.spacing}px
                <input
                  type="range"
                  min={8}
                  max={32}
                  step={2}
                  value={activeTheme.spacing}
                  onChange={(e) => setSpacing(Number(e.target.value))}
                  className="mt-2 w-full accent-violet-600"
                />
              </label>
              <button
                type="button"
                onClick={applyThemeToCanvas}
                className="w-full rounded-xl bg-zinc-900 py-2 text-xs font-semibold text-white"
              >
                Recalculate layout
              </button>
              <PropertiesBlock />
            </div>
          )}

          {sidebarTab === "layers" && (
            <div className="space-y-1">
              {sortedLayers.map((el) => (
                <button
                  key={el.id}
                  type="button"
                  onClick={() => selectElement(el.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-xs",
                    selectedId === el.id ? "bg-violet-100 text-violet-900" : "hover:bg-zinc-50"
                  )}
                >
                  <span className="truncate capitalize">
                    {el.locked && "🔒 "}
                    {el.type === "section"
                      ? el.sectionType
                      : el.type === "shape"
                        ? el.shapeType
                        : el.type === "image"
                          ? "Image"
                          : el.type === "divider"
                            ? "Divider"
                            : el.text?.slice(0, 20) ?? "Text"}
                  </span>
                  <span className="shrink-0 text-zinc-400">z{el.zIndex}</span>
                </button>
              ))}
              {selectedId && (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => bringForward(selectedId)}
                    className="flex-1 rounded-lg border py-1.5 text-xs"
                  >
                    Forward
                  </button>
                  <button
                    type="button"
                    onClick={() => sendBackward(selectedId)}
                    className="flex-1 rounded-lg border py-1.5 text-xs"
                  >
                    Back
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export const CanvaSidebar = memo(function CanvaSidebar(props: { cvId?: string | null }) {
  return <CanvaSidebarInner {...props} />;
});
