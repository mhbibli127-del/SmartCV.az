"use client";

import { useCallback } from "react";
import type { RefObject } from "react";
import type { CanvasEditorHandle } from "@/components/editor/CanvasEditor";
import { waitForCanvasReady } from "@/lib/canvas-ready";
import { blobToBase64 } from "@/lib/cv-editor/download-pdf";
import {
  captureKonvaActivePageFromEditor,
  captureKonvaPagesFromEditor,
  downloadBlob,
  exportKonvaDataUrl,
  exportKonvaPdf,
  type StudioExportFormat,
} from "@/lib/studio-export";
import { getCanvasStateFromStore, useEditorStore } from "@/lib/editor-store";
import { dispatchResumeGalleryUpdate } from "@/lib/resume-gallery-events";
import type { TemplateMetadata } from "@/types/design-system";

interface UseStudioExportOptions {
  canvasRef: RefObject<CanvasEditorHandle | null>;
  title: string;
  resumeId: string | null;
  template: TemplateMetadata | null;
  templateSlug: string | null;
  canvasReady: boolean;
  onSuccess: (message: string, description?: string) => void;
  onError: (message: string, description?: string) => void;
}

function getCanvasImageSources(): string[] {
  return useEditorStore
    .getState()
    .elements.filter((el) => el.type === "image" && el.src?.trim())
    .map((el) => el.src!.trim());
}

export function useStudioExport({
  canvasRef,
  title,
  resumeId,
  template,
  templateSlug,
  canvasReady,
  onSuccess,
  onError,
}: UseStudioExportOptions) {
  const setExporting = useEditorStore((s) => s.setExporting);
  const selectElement = useEditorStore((s) => s.selectElement);
  const setEditingId = useEditorStore((s) => s.setEditingId);

  const publishToGallery = useCallback(
    async (thumbnailDataUrl: string, pdfBase64: string) => {
      const canvas = getCanvasStateFromStore();
      const tplId = template?.id ?? templateSlug ?? "tpl-minimal-corporate";
      const res = await fetch("/api/resumes/publish-export", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: resumeId ?? undefined,
          title,
          templateId: tplId,
          templateName: template?.title,
          content: { mode: "visual", canvas },
          thumbnailDataUrl,
          pdfBase64,
        }),
      });
      if (!res.ok) throw new Error("Gallery publish failed");
      return res.json() as Promise<{ resumeId?: string }>;
    },
    [title, resumeId, template, templateSlug]
  );

  const exportDocument = useCallback(
    async (format: StudioExportFormat) => {
      if (!canvasReady) {
        onError("Export not ready", "Please wait for the canvas to finish loading.");
        return;
      }

      if (!canvasRef.current?.getPaperElement()) {
        onError("Export not ready", "Canvas not ready yet.");
        return;
      }

      selectElement(null);
      setEditingId(null);
      setExporting(true);

      try {
        const editor = await waitForCanvasReady(canvasRef);
        const imageSources = getCanvasImageSources();

        if (format === "pdf") {
          const dataUrls = await captureKonvaPagesFromEditor(editor, imageSources);
          const result = await exportKonvaPdf(dataUrls, title);
          downloadBlob(result.blob, result.filename);

          const pdfBase64 = await blobToBase64(result.blob);
          const published = await publishToGallery(result.dataUrl, pdfBase64);
          dispatchResumeGalleryUpdate({ resumeId: published.resumeId ?? resumeId ?? undefined });

          onSuccess("PDF exported", "Downloaded and saved to your workspace.");
          return;
        }

        const dataUrl = await captureKonvaActivePageFromEditor(
          editor,
          useEditorStore.getState().activePage,
          imageSources
        );

        const result = await exportKonvaDataUrl(dataUrl, format, title);
        downloadBlob(result.blob, result.filename);
        onSuccess(`${format.toUpperCase()} exported`, "Your resume image was downloaded.");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Could not generate the file.";
        onError("Export failed", msg);
      } finally {
        setExporting(false);
      }
    },
    [
      canvasRef,
      canvasReady,
      title,
      resumeId,
      onSuccess,
      onError,
      publishToGallery,
      selectElement,
      setEditingId,
      setExporting,
    ]
  );

  return { exportDocument };
}
