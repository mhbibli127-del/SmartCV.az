"use client";

import { memo, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  LayoutTemplate,
  Save,
} from "lucide-react";
import { useCvEditorStore } from "@/store/cv-editor-store";
import { EDITOR_TEMPLATES } from "@/lib/cv-editor/template-catalog";
import { cn } from "@/lib/utils";

interface EditorToolbarProps {
  title: string;
  onTitleChange: (v: string) => void;
  onSave: () => void;
  onExport: () => void;
  saving: boolean;
  exporting: boolean;
  exportDisabled?: boolean;
}

function EditorToolbarInner({
  title,
  onTitleChange,
  onSave,
  onExport,
  saving,
  exporting,
  exportDisabled,
}: EditorToolbarProps) {
  const template = useCvEditorStore((s) => s.template);
  const switchTemplate = useCvEditorStore((s) => s.switchTemplate);
  const saveStatus = useCvEditorStore((s) => s.saveStatus);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!templatesOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setTemplatesOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [templatesOpen]);

  const statusLabel =
    saveStatus === "saving"
      ? "Saving…"
      : saveStatus === "saved"
        ? "Saved"
        : saveStatus === "error"
          ? "Save failed"
          : null;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-zinc-200 bg-white px-4">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Overview</span>
        </Link>
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="min-w-0 max-w-[200px] truncate rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-zinc-900 hover:border-zinc-200 focus:border-zinc-300 focus:outline-none sm:max-w-xs"
          aria-label="Document title"
        />
        {statusLabel && (
          <span
            className={cn(
              "hidden text-xs md:inline",
              saveStatus === "error" ? "text-red-500" : "text-zinc-400"
            )}
          >
            {statusLabel}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setTemplatesOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <LayoutTemplate className="h-4 w-4" />
            <span className="hidden sm:inline">Change Template</span>
          </button>
          {templatesOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 max-h-80 w-56 overflow-y-auto rounded-xl border border-zinc-200 bg-white py-1 shadow-xl">
              {EDITOR_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    switchTemplate(t);
                    setTemplatesOpen(false);
                  }}
                  className={cn(
                    "flex w-full px-3 py-2 text-left text-sm hover:bg-zinc-50",
                    template?.id === t.id
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
          disabled={saving || exportDisabled}
          className="hidden items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex"
        >
          <Save className="h-4 w-4" />
          Save
        </button>

        <button
          type="button"
          onClick={onExport}
          disabled={exporting || exportDisabled}
          title={exportDisabled ? "Waiting for canvas…" : "Download PDF"}
          className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Download PDF</span>
          <span className="sm:hidden">PDF</span>
        </button>
      </div>
    </header>
  );
}

export const EditorToolbar = memo(EditorToolbarInner);
