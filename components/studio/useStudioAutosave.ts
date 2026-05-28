"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getCanvasStateFromStore, useEditorStore } from "@/lib/editor-store";
import { useDesignStore } from "@/lib/design-store";
import { canvasToSections } from "@/lib/cv-hydration";
import { designSnapshot } from "@/lib/design-persistence";
import { writeStudioDraft, type StudioDraft } from "@/lib/studio-draft";
import { dispatchResumeGalleryUpdate } from "@/lib/resume-gallery-events";

/** Local draft — fast, survives refresh */
const LOCAL_AUTOSAVE_MS = 2000;
/** Remote Prisma save — slower to reduce DB load */
const DB_AUTOSAVE_MS = 12_000;
const MAX_BACKOFF_MS = 60_000;

interface UseStudioAutosaveOptions {
  resumeId: string | null;
  title: string;
}

export function useStudioAutosave({ resumeId, title }: UseStudioAutosaveOptions) {
  const router = useRouter();
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

  useEffect(() => {
    resumeIdRef.current = resumeId;
  }, [resumeId]);

  useEffect(() => {
    if (localTimerRef.current) clearTimeout(localTimerRef.current);

    localTimerRef.current = setTimeout(() => {
      const draft: StudioDraft = {
        title,
        cvId: resumeIdRef.current,
        elements,
        pageCount,
        designTheme: activeTheme,
        selectedTemplateSlug: selectedTemplate?.slug ?? null,
        updatedAt: Date.now(),
      };
      writeStudioDraft(draft);
    }, LOCAL_AUTOSAVE_MS);

    return () => {
      if (localTimerRef.current) clearTimeout(localTimerRef.current);
    };
  }, [elements, title, pageCount, activeTheme, selectedTemplate]);

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

        savingRef.current = true;

        const tplId = selectedTemplate?.id ?? selectedTemplate?.slug ?? "tpl-minimal-corporate";
        const canvas = getCanvasStateFromStore();
        const design = designSnapshot(activeTheme, selectedTemplate);

        try {
          const res = await fetch("/api/resumes/save", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              resumeId: resumeIdRef.current ?? undefined,
              title,
              templateId: tplId,
              templateName: selectedTemplate?.title,
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
            if (!resumeIdRef.current && data.resumeId) {
              resumeIdRef.current = data.resumeId;
              router.replace(`/dashboard/studio?id=${data.resumeId}`);
            }
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
  }, [elements, title, pageCount, activeTheme, selectedTemplate, markSaved, router]);
}
