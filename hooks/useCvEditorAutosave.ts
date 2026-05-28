"use client";

import { useCallback, useEffect, useRef } from "react";
import { useCvEditorStore } from "@/store/cv-editor-store";
import { cvElementsToApiCanvas } from "@/lib/cv-editor/serialize-canvas";
import type { SaveStatus } from "@/types/cv-editor";
import type { ResumeContent } from "@/types/resume";

const DEBOUNCE_MS = 1500;

export interface SaveResumeAssets {
  thumbnailDataUrl?: string;
  pdfBase64?: string;
}

export function useCvEditorAutosave(title: string, enabled = true) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elements = useCvEditorStore((s) => s.elements);
  const background = useCvEditorStore((s) => s.background);
  const template = useCvEditorStore((s) => s.template);
  const cvId = useCvEditorStore((s) => s.cvId);
  const setCvId = useCvEditorStore((s) => s.setCvId);
  const setSaveStatus = useCvEditorStore((s) => s.setSaveStatus);

  const persist = useCallback(
    async (assets?: SaveResumeAssets) => {
      if (elements.length === 0) return;

      setSaveStatus("saving");
      const canvas = cvElementsToApiCanvas(elements, background);

      const content: ResumeContent = {
        mode: "visual",
        canvas,
        templateSlug: template?.slug,
        templateName: template?.name,
        templateId: template?.id,
        metadata: { version: 2, editor: "cv-builder" },
      };

      try {
        const res = await fetch("/api/resumes/save", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeId: cvId ?? undefined,
            title,
            templateId: template?.id ?? template?.slug ?? "tpl-minimal-corporate",
            templateName: template?.name,
            content,
            thumbnailDataUrl: assets?.thumbnailDataUrl,
            pdfBase64: assets?.pdfBase64,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Save failed");
        }

        const data = await res.json();
        if (data.resumeId && !cvId) {
          setCvId(data.resumeId);
          const url = new URL(window.location.href);
          url.searchParams.set("id", data.resumeId);
          if (template?.id) url.searchParams.set("template", template.id);
          window.history.replaceState(null, "", url.toString());
        }

        setSaveStatus("saved", new Date().toISOString());
      } catch {
        setSaveStatus("error");
        throw new Error("Save failed");
      }
    },
    [
      background,
      cvId,
      elements,
      setCvId,
      setSaveStatus,
      template,
      title,
    ]
  );

  useEffect(() => {
    if (!enabled || elements.length === 0) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void persist().catch(() => {});
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [elements, background, title, enabled, persist]);

  return { persist };
}

export function saveStatusColor(status: SaveStatus): string {
  switch (status) {
    case "saved":
      return "text-emerald-500";
    case "saving":
      return "text-amber-500";
    case "error":
      return "text-red-500";
    default:
      return "text-zinc-400";
  }
}
