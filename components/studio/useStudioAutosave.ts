"use client";

import { useEffect, useRef } from "react";
import { getCanvasStateFromStore, useEditorStore } from "@/lib/editor-store";
import { useDesignStore } from "@/lib/design-store";
import { canvasToSections } from "@/lib/cv-hydration";
import { designSnapshot } from "@/lib/design-persistence";
import { writeStudioDraft, type StudioDraft } from "@/lib/studio-draft";
import { dispatchResumeGalleryUpdate } from "@/lib/resume-gallery-events";
import {
  buildEditorAutosaveFingerprint,
  revisionFromElements,
  syncResumeIdInUrl,
} from "@/lib/resume-save-client";

const LOCAL_AUTOSAVE_MS = 2000;
const DB_AUTOSAVE_MS = 15_000;
const MAX_BACKOFF_MS = 60_000;
const MIN_DB_SAVE_INTERVAL_MS = 12_000;

interface UseStudioAutosaveOptions {
  resumeId: string | null;
  title: string;
}

export function useStudioAutosave({ resumeId, title }: UseStudioAutosaveOptions) {
  const elements = useEditorStore((s) => s.elements);
  const pageCount = useEditorStore((s) => s.pageCount);
  const markSaved = useEditorStore((s) => s.markSaved);
  const activeTheme = useDesignStore((s) => s.activeTheme);
  const selectedTemplate = useDesignStore((s) => s.selectedTemplate);

  const localTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dbTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);
  const resumeIdRef = useRef(resumeId);
  const failStreakRef = useRef(0);
  const backoffUntilRef = useRef(0);
  const lastSavedFingerprintRef = useRef<string | null>(null);
  const lastDbSaveAtRef = useRef(0);

  const themeKey = activeTheme.id;
  const templateKey = selectedTemplate?.slug ?? selectedTemplate?.id ?? "none";
  const elementRevision = revisionFromElements(
    elements.map((el) => ({
      id: el.id,
      content: el.text ?? el.content,
      src: el.src,
    }))
  );
  const dbFingerprint = buildEditorAutosaveFingerprint(
    title,
    themeKey,
    elements.length,
    `${elementRevision}|${templateKey}|${pageCount}`
  );

  resumeIdRef.current = resumeId;

  useEffect(() => {
    if (localTimerRef.current) clearTimeout(localTimerRef.current);

    localTimerRef.current = setTimeout(() => {
      const state = useEditorStore.getState();
      const design = useDesignStore.getState();
      const draft: StudioDraft = {
        title,
        cvId: resumeIdRef.current,
        elements: state.elements,
        pageCount: state.pageCount,
        designTheme: design.activeTheme,
        selectedTemplateSlug: design.selectedTemplate?.slug ?? null,
        updatedAt: Date.now(),
      };
      writeStudioDraft(draft);
    }, LOCAL_AUTOSAVE_MS);

    return () => {
      if (localTimerRef.current) clearTimeout(localTimerRef.current);
    };
  }, [dbFingerprint, title, pageCount, themeKey, templateKey]);

  useEffect(() => {
    if (dbTimerRef.current) clearTimeout(dbTimerRef.current);

    const delay =
      Date.now() < backoffUntilRef.current
        ? Math.max(DB_AUTOSAVE_MS, backoffUntilRef.current - Date.now())
        : DB_AUTOSAVE_MS;

    dbTimerRef.current = setTimeout(() => {
      void (async () => {
        if (savingRef.current) return;
        if (Date.now() < backoffUntilRef.current) return;
        if (elements.length === 0) return;
        if (Date.now() - lastDbSaveAtRef.current < MIN_DB_SAVE_INTERVAL_MS) return;
        if (lastSavedFingerprintRef.current === dbFingerprint && resumeIdRef.current) {
          return;
        }

        savingRef.current = true;

        const designState = useDesignStore.getState();
        const tpl = designState.selectedTemplate;
        const theme = designState.activeTheme;
        const tplId = tpl?.id ?? tpl?.slug ?? "tpl-minimal-corporate";
        const canvas = getCanvasStateFromStore();
        const design = designSnapshot(theme, tpl);

        try {
          const res = await fetch("/api/resumes/save", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              resumeId: resumeIdRef.current ?? undefined,
              title,
              templateId: tplId,
              templateName: tpl?.title,
              content: {
                mode: "visual",
                canvas,
                sections: canvasToSections(canvas.elements),
                designTheme: design,
              },
            }),
          });

          if (res.ok) {
            failStreakRef.current = 0;
            backoffUntilRef.current = 0;
            const data = await res.json();
            markSaved();
            if (data.resumeId && !resumeIdRef.current) {
              resumeIdRef.current = data.resumeId;
              syncResumeIdInUrl(data.resumeId, tpl?.slug ?? null);
            }
            lastSavedFingerprintRef.current = dbFingerprint;
            lastDbSaveAtRef.current = Date.now();
            dispatchResumeGalleryUpdate({
              resumeId: data.resumeId ?? resumeIdRef.current ?? undefined,
            });
          } else if (res.status === 503) {
            failStreakRef.current += 1;
            const retrySec = Number(res.headers.get("Retry-After") ?? 60);
            const backoffMs = Math.min(
              MAX_BACKOFF_MS,
              retrySec * 1000 * failStreakRef.current
            );
            backoffUntilRef.current = Date.now() + backoffMs;
          }
        } catch {
          failStreakRef.current += 1;
          backoffUntilRef.current =
            Date.now() + Math.min(MAX_BACKOFF_MS, 15_000 * failStreakRef.current);
        } finally {
          savingRef.current = false;
        }
      })();
    }, delay);

    return () => {
      if (dbTimerRef.current) clearTimeout(dbTimerRef.current);
    };
  }, [dbFingerprint, elements.length, markSaved, title]);

  return { resumeIdRef };
}
