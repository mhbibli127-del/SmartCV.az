"use client";

import { memo, useState } from "react";
import {
  FileText,
  LayoutGrid,
  Palette,
  Download,
  Plus,
  Image as ImageIcon,
} from "lucide-react";
import { useEditorStore } from "@/lib/editor-store";
import { useDesignStore } from "@/lib/design-store";
import { FONT_PAIRINGS, PALETTES } from "@/lib/design-engine/themes";
import MediaUploadDropzone from "@/components/media/MediaUploadDropzone";
import { cn } from "@/lib/utils";
import type { CVSectionType } from "@/types/cv-document";

export type StudioTool = "content" | "layout" | "style" | "export";

const TOOLS: { id: StudioTool; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "content", label: "Content", icon: FileText },
  { id: "layout", label: "Layout", icon: LayoutGrid },
  { id: "style", label: "Style", icon: Palette },
  { id: "export", label: "Export", icon: Download },
];

const SECTIONS: { type: CVSectionType; label: string }[] = [
  { type: "summary", label: "Summary" },
  { type: "experience", label: "Experience" },
  { type: "education", label: "Education" },
  { type: "skills", label: "Skills" },
  { type: "projects", label: "Projects" },
];

interface StudioToolsPanelProps {
  cvId?: string | null;
  onSave: () => void;
  onExportPdf: () => void;
  onExportPng?: () => void;
  saving?: boolean;
}

function StudioToolsPanelInner({
  cvId,
  onSave,
  onExportPdf,
  onExportPng,
  saving,
}: StudioToolsPanelProps) {
  const [tool, setTool] = useState<StudioTool>("content");
  const addTextElement = useEditorStore((s) => s.addTextElement);
  const addSectionBlock = useEditorStore((s) => s.addSectionBlock);
  const addImageElement = useEditorStore((s) => s.addImageElement);
  const applyThemeToCanvas = useDesignStore((s) => s.applyThemeToCanvas);
  const setPaletteAccent = useDesignStore((s) => s.setPaletteAccent);
  const setFontPairing = useDesignStore((s) => s.setFontPairing);
  const setSpacing = useDesignStore((s) => s.setSpacing);
  const activeTheme = useDesignStore((s) => s.activeTheme);
  const isDirty = useEditorStore((s) => s.isDirty);

  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-zinc-200 bg-white">
      <nav className="flex border-b border-zinc-100 p-2">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            title={t.label}
            onClick={() => setTool(t.id)}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-[10px] font-medium transition",
              tool === t.id ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-50"
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </nav>

      <div className="flex-1 overflow-y-auto p-4">
        {tool === "content" && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => addTextElement()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 py-2.5 text-sm font-medium hover:bg-zinc-50"
            >
              <Plus className="h-4 w-4" />
              Add text
            </button>
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
              Sections
            </p>
            <div className="grid grid-cols-2 gap-2">
              {SECTIONS.map((s) => (
                <button
                  key={s.type}
                  type="button"
                  onClick={() => addSectionBlock(s.type)}
                  className="rounded-lg border border-zinc-200 px-2 py-2 text-xs font-medium hover:border-zinc-300 hover:bg-zinc-50"
                >
                  {s.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
              Image
            </p>
            <MediaUploadDropzone
              context="resume"
              compact
              label="Upload image"
              cvId={cvId ?? undefined}
              onUploaded={(m) => addImageElement(m.optimizedUrl || m.secureUrl)}
            />
          </div>
        )}

        {tool === "layout" && (
          <div className="space-y-4">
            <label className="block text-xs text-zinc-600">
              Section spacing
              <input
                type="range"
                min={8}
                max={32}
                step={2}
                value={activeTheme.spacing}
                onChange={(e) => setSpacing(Number(e.target.value))}
                className="mt-2 w-full accent-zinc-900"
              />
              <span className="mt-1 block text-zinc-400">{activeTheme.spacing}px</span>
            </label>
            <button
              type="button"
              onClick={applyThemeToCanvas}
              className="w-full rounded-xl bg-zinc-900 py-2 text-xs font-semibold text-white"
            >
              Apply spacing
            </button>
          </div>
        )}

        {tool === "style" && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {PALETTES.slice(0, 6).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  title={p.name}
                  onClick={() => setPaletteAccent(p.accent)}
                  className="h-8 w-8 rounded-full ring-2 ring-zinc-100 transition hover:scale-110"
                  style={{ background: p.accent }}
                />
              ))}
            </div>
            <select
              value={activeTheme.fonts.id}
              onChange={(e) => {
                const pair = FONT_PAIRINGS.find((f) => f.id === e.target.value);
                if (pair) setFontPairing(pair.heading, pair.body);
              }}
              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
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
              Apply style
            </button>
          </div>
        )}

        {tool === "export" && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={onSave}
              disabled={saving || !isDirty}
              className="w-full rounded-xl border border-zinc-200 py-2.5 text-sm font-medium disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={onExportPdf}
              className="w-full rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white"
            >
              Export PDF
            </button>
            {onExportPng && (
              <button
                type="button"
                onClick={onExportPng}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 py-2.5 text-sm font-medium"
              >
                <ImageIcon className="h-4 w-4" />
                Export PNG
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

export const StudioToolsPanel = memo(StudioToolsPanelInner);
