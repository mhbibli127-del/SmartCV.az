"use client";

import React from "react";
import { Save, Download, Eye, RefreshCw, LayoutTemplate } from "lucide-react";
import { useBuilder } from "@/lib/builder-state";
import { useAnalytics } from "@/lib/analytics";
import TemplateSelector from "./TemplateSelector";
import { Button } from "@/components/ui/button";

interface BuilderHeaderProps {
  cvId?: string | null;
  onSave: () => Promise<void>;
  onExport: () => Promise<void>;
  onPreview: () => void;
  onReset: () => void;
  onOpenVisual?: () => Promise<void>;
}

export default function BuilderHeader({
  cvId,
  onSave,
  onExport,
  onPreview,
  onReset,
  onOpenVisual,
}: BuilderHeaderProps) {
  const { isDirty, isSaving, lastSaved } = useBuilder();
  const { trackButtonClick, trackResumeExported } = useAnalytics();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">My CVs</p>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Content & layout</h1>
          {lastSaved && (
            <p className="mt-0.5 text-xs text-zinc-400">
              Last saved {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              if (onOpenVisual) await onOpenVisual();
            }}
          >
            <LayoutTemplate className="h-3.5 w-3.5" />
            Visual editor
          </Button>
          <Button variant="outline" size="sm" onClick={onReset}>
            <RefreshCw className="h-3.5 w-3.5" />
            Reset
          </Button>
          <Button variant="outline" size="sm" onClick={onPreview}>
            <Eye className="h-3.5 w-3.5" />
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await trackButtonClick("Save CV", "save-cv", "/dashboard/builder");
              await onSave();
            }}
            disabled={isSaving || !isDirty}
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? "Saving…" : "Save"}
          </Button>
          <Button
            size="sm"
            onClick={async () => {
              await trackButtonClick("Export PDF", "export-cv", "/dashboard/builder");
              trackResumeExported({ format: "pdf", cvId: cvId ?? undefined });
              await onExport();
            }}
          >
            <Download className="h-3.5 w-3.5" />
            Export PDF
          </Button>
        </div>
      </div>
      <TemplateSelector />
    </div>
  );
}
