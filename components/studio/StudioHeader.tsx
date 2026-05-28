"use client";

import { memo, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  Download,
  FileImage,
  FileText,
  LayoutTemplate,
  Minus,
  PanelLeft,
  PanelRight,
  Plus,
  Redo2,
  Save,
  Shield,
  Undo2,
} from "lucide-react";
import { useEditorStore } from "@/lib/editor-store";
import { useDesignStore } from "@/lib/design-store";
import { EDITOR_TEMPLATES } from "@/lib/cv-editor/template-catalog";
import type { StudioExportFormat } from "@/lib/studio-export";
import { cn } from "@/lib/utils";

interface StudioHeaderProps {
  title: string;
  onTitleChange: (value: string) => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onSave: () => void;
  onExport: (format: StudioExportFormat) => void;
  exporting?: boolean;
  exportDisabled?: boolean;
  saving?: boolean;
  templatesOpen: boolean;
  onToggleTemplates: () => void;
  onSelectTemplate: (templateId: string) => void;
  onToggleLeftPanel?: () => void;
  onToggleRightPanel?: () => void;
}

const EXPORT_OPTIONS: {
  format: StudioExportFormat;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { format: "pdf", label: "PDF (A4)", icon: FileText },
  { format: "png", label: "PNG image", icon: FileImage },
  { format: "jpg", label: "JPG image", icon: FileImage },
];

function StudioHeaderInner({
  title,
  onTitleChange,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onSave,
  onExport,
  exporting,
  exportDisabled,
  saving,
  templatesOpen,
  onToggleTemplates,
  onSelectTemplate,
  onToggleLeftPanel,
  onToggleRightPanel,
}: StudioHeaderProps) {
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const canUndo = useEditorStore((s) => s.canUndo);
  const canRedo = useEditorStore((s) => s.canRedo);
  const isDirty = useEditorStore((s) => s.isDirty);
  const selectedTemplate = useDesignStore((s) => s.selectedTemplate);
  const atsSafeMode = useDesignStore((s) => s.atsSafeMode);
  const toggleAtsSafeMode = useDesignStore((s) => s.toggleAtsSafeMode);

  const templateLabel = selectedTemplate?.title ?? "Untitled template";
  const saveLabel = saving ? "Saving…" : isDirty ? "Unsaved changes" : "Saved";

  useEffect(() => {
    if (!exportOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [exportOpen]);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-zinc-200 bg-white/95 px-4 backdrop-blur-md md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href="/dashboard/templates"
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Templates</span>
        </Link>

        <div className="hidden h-6 w-px bg-zinc-200 md:block" />

        <div className="min-w-0">
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="block max-w-[140px] truncate bg-transparent text-sm font-semibold text-zinc-900 focus:outline-none sm:max-w-[200px] md:max-w-xs"
            aria-label="Document title"
          />
          <p className="truncate text-[11px] text-zinc-400">{templateLabel}</p>
        </div>

        <span
          className={cn(
            "hidden text-xs md:inline",
            isDirty ? "text-amber-600" : "text-zinc-400"
          )}
        >
          {saveLabel}
        </span>
      </div>

      <div className="flex items-center gap-1">
        {onToggleLeftPanel && (
          <HeaderBtn onClick={onToggleLeftPanel} title="Toggle tools" className="lg:hidden">
            <PanelLeft className="h-4 w-4" />
          </HeaderBtn>
        )}
        {onToggleRightPanel && (
          <HeaderBtn onClick={onToggleRightPanel} title="Toggle properties" className="xl:hidden">
            <PanelRight className="h-4 w-4" />
          </HeaderBtn>
        )}

        <HeaderBtn onClick={undo} disabled={!canUndo()} title="Undo (Ctrl+Z)">
          <Undo2 className="h-4 w-4" />
        </HeaderBtn>
        <HeaderBtn onClick={redo} disabled={!canRedo()} title="Redo (Ctrl+Shift+Z)">
          <Redo2 className="h-4 w-4" />
        </HeaderBtn>

        <div className="mx-1 hidden h-6 w-px bg-zinc-200 sm:block" />

        <HeaderBtn onClick={onZoomOut} title="Zoom out">
          <Minus className="h-4 w-4" />
        </HeaderBtn>
        <button
          type="button"
          onClick={onZoomReset}
          className="min-w-[3rem] rounded-lg px-1 py-2 text-xs font-medium text-zinc-500 hover:bg-zinc-100"
          title="Reset zoom"
        >
          {Math.round(zoom * 100)}%
        </button>
        <HeaderBtn onClick={onZoomIn} title="Zoom in">
          <Plus className="h-4 w-4" />
        </HeaderBtn>

        <div className="mx-1 hidden h-6 w-px bg-zinc-200 sm:block" />

        <button
          type="button"
          onClick={toggleAtsSafeMode}
          title="ATS Safe mode"
          className={cn(
            "hidden items-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-medium sm:flex",
            atsSafeMode
              ? "border-emerald-600 bg-emerald-50 text-emerald-800"
              : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
          )}
        >
          <Shield className="h-3.5 w-3.5" />
          ATS Safe
        </button>

        <div className="mx-1 hidden h-6 w-px bg-zinc-200 sm:block" />

        <div className="relative">
          <button
            type="button"
            onClick={onToggleTemplates}
            className="hidden items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 sm:flex"
          >
            <LayoutTemplate className="h-3.5 w-3.5" />
            Change Template
          </button>
          {templatesOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 max-h-72 w-52 overflow-y-auto rounded-xl border border-zinc-200 bg-white py-1 shadow-xl">
              {EDITOR_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelectTemplate(t.slug)}
                  className={cn(
                    "flex w-full px-3 py-2 text-left text-sm hover:bg-zinc-50",
                    selectedTemplate?.slug === t.slug
                      ? "font-semibold text-zinc-900"
                      : "text-zinc-600"
                  )}
                >
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="hidden items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 sm:flex"
        >
          <Save className="h-3.5 w-3.5" />
          Save
        </button>

        <div className="relative" ref={exportRef}>
          <button
            type="button"
            disabled={exporting || exportDisabled}
            onClick={() => setExportOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            title={exportDisabled ? "Waiting for canvas…" : "Export resume"}
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {exporting ? "Exporting…" : exportDisabled ? "Preparing…" : "Export"}
            </span>
            <ChevronDown className="h-3 w-3 opacity-70" />
          </button>
          {exportOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-xl">
              {EXPORT_OPTIONS.map((opt) => (
                <button
                  key={opt.format}
                  type="button"
                  disabled={exporting || exportDisabled}
                  onClick={() => {
                    if (exportDisabled) return;
                    setExportOpen(false);
                    onExport(opt.format);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                >
                  <opt.icon className="h-4 w-4 text-zinc-500" />
                  {opt.label}
                </button>
              ))}
              <div className="border-t border-zinc-100 px-3 py-2 text-[10px] text-zinc-400">
                PDF also publishes to Examples gallery
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function HeaderBtn({
  children,
  onClick,
  disabled,
  title,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 disabled:opacity-30",
        className
      )}
    >
      {children}
    </button>
  );
}

export const StudioHeader = memo(StudioHeaderInner);
