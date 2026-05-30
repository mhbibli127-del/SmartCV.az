"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createDefaultCanvas } from "@/lib/layout-engine";
import { hydrateCvData, sectionsToCanvasElements } from "@/lib/cv-hydration";
import { pdfImportToSections } from "@/lib/pdf-import-hydration";
import type { PdfImportPayload } from "@/types/pdf-import";
import { restoreDesignFromContent } from "@/lib/design-persistence";
import { useEditorStore } from "@/lib/editor-store";
import { useDesignStore } from "@/lib/design-store";
import {
  draftMatchesSession,
  readStudioDraft,
  clearStudioDraft,
} from "@/lib/studio-draft";
import { normalizeTemplateSlug } from "@/lib/template-engine/registry";
import {
  cancelTemplateHydration,
  hydrateStudioTemplate,
} from "@/lib/template-engine/hydrate";
import { clearEntireEditorState } from "@/lib/template-engine/reset";
import type { CVContent, EditorElement } from "@/types/cv-document";
import type { ResumeContent } from "@/types/resume";

export type StudioHydrationPhase = "idle" | "hydrating" | "ready" | "error";

export function useStudioHydration(options: {
  cvId: string | null;
  templateSlug: string | null;
  title: string;
  onTitle?: (title: string) => void;
}) {
  const { cvId, templateSlug, title, onTitle } = options;
  const router = useRouter();
  const loadElements = useEditorStore((s) => s.loadElements);
  const hydrateDesign = useDesignStore((s) => s.hydrateDesign);
  const applyThemeToCanvas = useDesignStore((s) => s.applyThemeToCanvas);

  const [phase, setPhase] = useState<StudioHydrationPhase>("idle");
  const [sessionKey, setSessionKey] = useState("init");
  const [renderVersion, setRenderVersion] = useState(0);
  const hydrationRunRef = useRef(0);
  const lastHydratedKeyRef = useRef<string | null>(null);
  const readyRef = useRef(false);

  const hydrateFromSavedContent = useCallback(
    (content: ResumeContent, resumeTitle?: string) => {
      const sections = Array.isArray(content.sections) ? content.sections : [];
      const hydrated = hydrateCvData({
        sections,
        generatorData: content.generatorData as Record<string, unknown> | undefined,
        canvas: content.canvas,
        mode: content.mode,
      });
      const canvas = content.canvas as
        | { elements?: EditorElement[]; background?: string }
        | undefined;
      const bg = canvas?.background ?? "#ffffff";
      if (canvas?.elements?.length) {
        loadElements(canvas.elements, { background: bg });
      } else if (hydrated.sections?.length) {
        loadElements(sectionsToCanvasElements(hydrated.sections), { background: bg });
      } else {
        loadElements(createDefaultCanvas().elements, { background: bg });
      }
      const restored = restoreDesignFromContent(content as CVContent);
      if (restored) hydrateDesign(restored);
      applyThemeToCanvas();
      if (resumeTitle) onTitle?.(resumeTitle);
    },
    [loadElements, hydrateDesign, applyThemeToCanvas, onTitle]
  );

  const finishReady = useCallback((key: string, slug: string, version: number) => {
    lastHydratedKeyRef.current = key;
    readyRef.current = true;
    setSessionKey(`${slug}-${version}`);
    setRenderVersion(version);
    setPhase("ready");
  }, []);

  const switchTemplate = useCallback(
    async (slugOrId: string, updateUrl = true) => {
      const runId = ++hydrationRunRef.current;
      readyRef.current = false;
      setPhase("hydrating");

      const result = await hydrateStudioTemplate(slugOrId, {
        cvId,
        title,
        persistDraft: true,
      });

      if (runId !== hydrationRunRef.current) return false;
      if (!result.ok) {
        setPhase("error");
        return false;
      }

      const initKey = `${cvId ?? "new"}|${result.slug}`;
      finishReady(initKey, result.slug, result.renderVersion);

      if (updateUrl) {
        const slug = normalizeTemplateSlug(slugOrId) ?? slugOrId;
        const params = new URLSearchParams();
        params.set("template", slug);
        if (cvId) params.set("id", cvId);
        router.replace(`/dashboard/studio?${params.toString()}`);
      }

      return true;
    },
    [cvId, title, router, finishReady]
  );

  useEffect(() => {
    const normalizedSlug = normalizeTemplateSlug(templateSlug);
    const initKey = `${cvId ?? "new"}|${normalizedSlug ?? ""}`;
    const runId = ++hydrationRunRef.current;

    if (lastHydratedKeyRef.current === initKey && readyRef.current) {
      return;
    }

    const existingElements = useEditorStore.getState().elements;
    if (cvId && existingElements.length > 0 && lastHydratedKeyRef.current) {
      lastHydratedKeyRef.current = initKey;
      readyRef.current = true;
      const slug = useEditorStore.getState().activeTemplateSlug ?? normalizedSlug ?? "saved";
      const version = useEditorStore.getState().renderVersion;
      setSessionKey(`${slug}-${version}`);
      setRenderVersion(version);
      setPhase("ready");
      return;
    }

    let cancelled = false;
    readyRef.current = false;
    setPhase("hydrating");

    const run = async () => {
      if (!cvId && typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.get("import") === "pdf") {
          try {
            const raw = localStorage.getItem("extractedPdfData");
            localStorage.removeItem("extractedPdfData");
            if (raw) {
              const data = JSON.parse(raw) as PdfImportPayload;
              if (cancelled || runId !== hydrationRunRef.current) return;
              clearEntireEditorState();
              const sections = pdfImportToSections(data);
              loadElements(sectionsToCanvasElements(sections), { background: "#ffffff" });
              applyThemeToCanvas();
              if (data.fullName) onTitle?.(`${data.fullName} — CV`);
              finishReady(initKey, "pdf-import", useEditorStore.getState().renderVersion);
              const next = new URLSearchParams();
              if (normalizedSlug) next.set("template", normalizedSlug);
              router.replace(
                next.toString()
                  ? `/dashboard/studio?${next.toString()}`
                  : "/dashboard/studio"
              );
              return;
            }
          } catch {
            /* fall through */
          }
        }
      }

      if (cvId) {
        try {
          const res = await fetch(`/api/resumes/${cvId}`, { credentials: "include" });
          if (res.ok) {
            const data = await res.json();
            if (cancelled || runId !== hydrationRunRef.current) return;
            clearEntireEditorState();
            const content = (data.resume?.content ?? { mode: "visual" }) as ResumeContent;
            hydrateFromSavedContent(content, data.resume?.title ?? "Untitled CV");
            const slug =
              normalizeTemplateSlug(
                templateSlug ??
                  (content as CVContent).designTheme?.templateSlug ??
                  content.templateSlug ??
                  data.resume?.templateId ??
                  null
              ) ?? "saved";
            finishReady(initKey, slug, useEditorStore.getState().renderVersion);
            return;
          }
        } catch {
          /* fall through */
        }
      }

      if (normalizedSlug && !cvId) {
        clearStudioDraft();
        const result = await hydrateStudioTemplate(normalizedSlug, {
          cvId,
          persistDraft: false,
        });
        if (cancelled || runId !== hydrationRunRef.current) return;
        if (result.ok) {
          finishReady(initKey, result.slug, result.renderVersion);
          return;
        }
      }

      const draft = readStudioDraft();
      const draftSlug = draft?.selectedTemplateSlug
        ? normalizeTemplateSlug(draft.selectedTemplateSlug)
        : null;
      const requestedSlug = normalizedSlug ?? draftSlug;

      if (
        draft &&
        draft.elements?.length &&
        draftMatchesSession(draft, cvId, requestedSlug ?? undefined)
      ) {
        if (cancelled || runId !== hydrationRunRef.current) return;
        clearEntireEditorState();
        loadElements(draft.elements);
        if (draft.designTheme) {
          hydrateDesign({
            theme: draft.designTheme,
            templateSlug: draft.selectedTemplateSlug ?? undefined,
          });
        }
        applyThemeToCanvas();
        if (draft.title) onTitle?.(draft.title);
        finishReady(
          initKey,
          draft.selectedTemplateSlug ?? "draft",
          useEditorStore.getState().renderVersion
        );
        return;
      }

      if (cancelled || runId !== hydrationRunRef.current) return;

      if (normalizedSlug) {
        const result = await hydrateStudioTemplate(normalizedSlug, { cvId, persistDraft: false });
        if (cancelled || runId !== hydrationRunRef.current) return;
        if (result.ok) {
          finishReady(initKey, result.slug, result.renderVersion);
          return;
        }
      }

      clearEntireEditorState();
      loadElements(createDefaultCanvas().elements);
      applyThemeToCanvas();
      finishReady(initKey, "default", useEditorStore.getState().renderVersion);
    };

    void run();

    return () => {
      cancelled = true;
      cancelTemplateHydration();
    };
  }, [cvId, templateSlug, hydrateFromSavedContent, loadElements, hydrateDesign, applyThemeToCanvas, onTitle, finishReady, router]);

  useEffect(() => {
    return () => {
      cancelTemplateHydration();
    };
  }, []);

  const elements = useEditorStore((s) => s.elements);
  const isHydrating = phase === "hydrating" || phase === "idle";

  return {
    phase,
    isHydrating,
    sessionKey,
    renderVersion,
    elements,
    switchTemplate,
    isReady: phase === "ready" && elements.length > 0,
  };
}
