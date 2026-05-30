"use client";

import { useCallback, useEffect, useRef } from "react";
import { useCvEditorStore } from "@/store/cv-editor-store";
import { cvElementsToApiCanvas } from "@/lib/cv-editor/serialize-canvas";
import {
  buildEditorAutosaveFingerprint,
  revisionFromElements,
  syncResumeIdInUrl,
} from "@/lib/resume-save-client";
import {
  isResumeDbAvailable,
  markResumeDbUnavailable,
} from "@/lib/resume-db-client";
import type { SaveStatus } from "@/types/cv-editor";
import type { ResumeContent } from "@/types/resume";

const DEBOUNCE_MS = 2500;
const MIN_SAVE_INTERVAL_MS = 3000;

export interface SaveResumeAssets {
  thumbnailDataUrl?: string;
  pdfBase64?: string;
}

export function useCvEditorAutosave(title: string, enabled = true) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);
  const cvIdRef = useRef<string | null>(null);
  const lastSavedFingerprintRef = useRef<string | null>(null);
  const lastSaveAtRef = useRef(0);
  const dbAvailableRef = useRef<boolean | null>(null);

  const elements = useCvEditorStore((s) => s.elements);
  const background = useCvEditorStore((s) => s.background);
  const template = useCvEditorStore((s) => s.template);
  const cvId = useCvEditorStore((s) => s.cvId);
  const setCvId = useCvEditorStore((s) => s.setCvId);
  const setSaveStatus = useCvEditorStore((s) => s.setSaveStatus);

  cvIdRef.current = cvId;

  const elementRevision = revisionFromElements(elements);
  const fingerprint = buildEditorAutosaveFingerprint(
    title,
    background,
    elements.length,
    elementRevision
  );

  const persist = useCallback(
    async (assets?: SaveResumeAssets) => {
      if (elements.length === 0 || savingRef.current) return;

      const currentFingerprint = buildEditorAutosaveFingerprint(
        title,
        background,
        elements.length,
        revisionFromElements(elements)
      );

      if (
        lastSavedFingerprintRef.current === currentFingerprint &&
        cvIdRef.current
      ) {
        return;
      }

      if (dbAvailableRef.current === false) {
        setSaveStatus("idle");
        return;
      }

      if (dbAvailableRef.current === null) {
        dbAvailableRef.current = await isResumeDbAvailable();
        if (!dbAvailableRef.current) {
          setSaveStatus("idle");
          return;
        }
      }

      savingRef.current = true;
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
            resumeId: cvIdRef.current ?? undefined,
            title,
            templateId: template?.id ?? template?.slug ?? "tpl-minimal-corporate",
            templateName: template?.name,
            content,
            thumbnailDataUrl: assets?.thumbnailDataUrl,
            pdfBase64: assets?.pdfBase64,
          }),
        });

        if (!res.ok) {
          if (res.status === 503) {
            markResumeDbUnavailable();
            dbAvailableRef.current = false;
          }
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Save failed");
        }

        const data = await res.json();
        if (data.resumeId && !cvIdRef.current) {
          cvIdRef.current = data.resumeId;
          setCvId(data.resumeId);
          syncResumeIdInUrl(data.resumeId, template?.id ?? template?.slug ?? null);
        }

        lastSavedFingerprintRef.current = currentFingerprint;
        lastSaveAtRef.current = Date.now();
        setSaveStatus("saved", new Date().toISOString());
      } catch {
        setSaveStatus("error");
        throw new Error("Save failed");
      } finally {
        savingRef.current = false;
      }
    },
    [background, elements, setCvId, setSaveStatus, template, title]
  );

  useEffect(() => {
    if (!enabled || elements.length === 0) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      if (savingRef.current) return;
      if (Date.now() - lastSaveAtRef.current < MIN_SAVE_INTERVAL_MS) return;
      if (lastSavedFingerprintRef.current === fingerprint && cvIdRef.current) {
        return;
      }

      void persist().catch((err) => {
        console.error("[cv-editor/autosave]", err);
      });
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, fingerprint, persist]);

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
