"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CvEditorShell } from "@/components/editor/cv-builder/CvEditorShell";
import type { EditorCanvasHandle } from "@/components/editor/cv-builder/EditorCanvas";
import { getEditorTemplate } from "@/lib/cv-editor/template-catalog";
import { apiCanvasToCvElements, cvElementsToApiCanvas } from "@/lib/cv-editor/serialize-canvas";
import { captureCanvasForSave } from "@/lib/cv-editor/capture-canvas";
import { downloadPdfFromBase64 } from "@/lib/cv-editor/download-pdf";
import { useCvEditorStore } from "@/store/cv-editor-store";
import { useCvEditorAutosave } from "@/hooks/useCvEditorAutosave";
import { useToast } from "@/components/ui/use-toast";
import { SkeletonEditor } from "@/components/ui/skeleton";
import { useAnalytics } from "@/lib/analytics";
import { waitForCanvasReady } from "@/lib/canvas-ready";
import { useCanvasReady } from "@/hooks/useCanvasReady";
import type { EditorCanvasState } from "@/types/cv-document";

function EditorPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const templateId = params.get("template");
  const cvIdParam = params.get("id");

  const canvasRef = useRef<EditorCanvasHandle>(null);
  const initKeyRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [title, setTitle] = useState("Untitled CV");

  const loadTemplate = useCvEditorStore((s) => s.loadTemplate);
  const resetForNewTemplate = useCvEditorStore((s) => s.resetForNewTemplate);
  const loadDocument = useCvEditorStore((s) => s.loadDocument);
  const setCvId = useCvEditorStore((s) => s.setCvId);
  const elements = useCvEditorStore((s) => s.elements);
  const background = useCvEditorStore((s) => s.background);
  const template = useCvEditorStore((s) => s.template);
  const cvId = useCvEditorStore((s) => s.cvId);

  const { success, error: toastError } = useToast();
  const { trackPageView } = useAnalytics();
  const { persist } = useCvEditorAutosave(title, !loading && elements.length > 0);
  const isCanvasReady = useCanvasReady(canvasRef, !loading && elements.length > 0);

  useEffect(() => {
    trackPageView("/dashboard/editor");
  }, [trackPageView]);

  useEffect(() => {
    const initKey = `${cvIdParam ?? "new"}|${templateId ?? ""}`;
    const storeCvId = useCvEditorStore.getState().cvId;
    const existingElements = useCvEditorStore.getState().elements;

    if (initKeyRef.current === initKey && existingElements.length > 0) {
      setLoading(false);
      return;
    }

    // Autosave synced ?id= via replaceState — do not reload and re-trigger save loop.
    if (
      cvIdParam &&
      storeCvId === cvIdParam &&
      existingElements.length > 0
    ) {
      initKeyRef.current = initKey;
      setLoading(false);
      return;
    }

    let cancelled = false;

    const init = async () => {
      setLoading(true);

      try {
        if (cvIdParam) {
          const resumeRes = await fetch(`/api/resumes/${cvIdParam}`, {
            credentials: "include",
          });

          if (resumeRes.ok) {
            const data = await resumeRes.json();
            if (cancelled) return;

            const resume = data.resume;
            const canvas = resume.content?.canvas as EditorCanvasState | undefined;
            const slug =
              templateId ??
              resume.templateId ??
              resume.content?.templateSlug ??
              resume.content?.templateId;
            const template = getEditorTemplate(slug);

            if (canvas?.elements?.length) {
              loadDocument({
                elements: apiCanvasToCvElements(canvas),
                template,
                cvId: cvIdParam,
                title: resume.title,
                background: canvas.background,
              });
            } else if (template) {
              loadTemplate(template);
              setCvId(cvIdParam);
            } else {
              throw new Error("Template not found");
            }

            setTitle(resume.title ?? "Untitled CV");
            initKeyRef.current = initKey;
            return;
          }

          const res = await fetch(`/api/cv/${cvIdParam}`, { credentials: "include" });
          if (!res.ok) throw new Error("Failed to load CV");
          const data = await res.json();
          if (cancelled) return;

          const content = data.cv?.content ?? {};
          const canvas = content.canvas as EditorCanvasState | undefined;
          const slug =
            templateId ??
            content.templateSlug ??
            content.designTheme?.templateSlug ??
            content.templateId;
          const template = getEditorTemplate(slug);

          if (canvas?.elements?.length) {
            loadDocument({
              elements: apiCanvasToCvElements(canvas),
              template,
              cvId: cvIdParam,
              title: data.cv?.title,
              background: canvas.background,
            });
          } else if (template) {
            loadTemplate(template);
            setCvId(cvIdParam);
          } else {
            throw new Error("Template not found");
          }

          setTitle(data.cv?.title ?? "Untitled CV");
          initKeyRef.current = initKey;
          return;
        }

        if (!templateId) {
          router.replace("/dashboard/templates");
          return;
        }

        const template = getEditorTemplate(templateId);
        if (!template) {
          router.replace("/dashboard/templates");
          return;
        }

        resetForNewTemplate(template);
        setTitle(`${template.name} CV`);
        initKeyRef.current = initKey;
      } catch {
        if (cancelled) return;
        toastError("Load failed", "Could not open the editor.");
        if (templateId) {
          const fallback = getEditorTemplate(templateId);
          if (fallback) resetForNewTemplate(fallback);
        }
        initKeyRef.current = initKey;
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void init();

    return () => {
      cancelled = true;
    };
  }, [
    cvIdParam,
    templateId,
    loadDocument,
    loadTemplate,
    resetForNewTemplate,
    router,
    setCvId,
    toastError,
  ]);

  const handleSave = async () => {
    if (!isCanvasReady) {
      toastError("Save failed", "Canvas not ready yet.");
      return;
    }

    setSaving(true);
    try {
      const editor = await waitForCanvasReady(canvasRef);
      const paper = editor.getPaperElement();
      if (!paper) throw new Error("Canvas not ready");
      const assets = await captureCanvasForSave(paper);
      await persist(assets);
      success("Saved", "Your resume was saved.");
    } catch {
      toastError("Save failed", "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = useCallback(async () => {
    if (!isCanvasReady) {
      toastError("Export failed", "Canvas not ready yet.");
      return;
    }

    setExporting(true);
    try {
      const editor = await waitForCanvasReady(canvasRef);
      const paper = editor.getPaperElement();
      if (!paper) throw new Error("Canvas not ready");

      const assets = await captureCanvasForSave(paper);
      downloadPdfFromBase64(assets.pdfBase64, title.replace(/\s+/g, "_"));

      const canvas = cvElementsToApiCanvas(elements, background);
      const res = await fetch("/api/resumes/publish-export", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: cvId ?? undefined,
          title,
          templateId: template?.id ?? template?.slug ?? "tpl-minimal-corporate",
          templateName: template?.name,
          content: {
            mode: "visual",
            canvas,
            templateSlug: template?.slug,
            templateName: template?.name,
            metadata: { version: 2, editor: "cv-builder" },
          },
          thumbnailDataUrl: assets.thumbnailDataUrl,
          pdfBase64: assets.pdfBase64,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Publish failed");
      }

      const data = await res.json();
      if (data.resumeId && !cvId) {
        setCvId(data.resumeId);
      }

      success("Exported", "PDF downloaded and added to community gallery.");
    } catch (err) {
      toastError(
        "Export failed",
        err instanceof Error ? err.message : "Could not generate PDF."
      );
    } finally {
      setExporting(false);
    }
  }, [
    background,
    canvasRef,
    cvId,
    elements,
    isCanvasReady,
    setCvId,
    success,
    template,
    title,
    toastError,
  ]);

  if (loading) return <SkeletonEditor />;

  return (
    <CvEditorShell
      canvasRef={canvasRef}
      title={title}
      onTitleChange={setTitle}
      onSave={handleSave}
      onExport={handleExport}
      saving={saving}
      exporting={exporting}
      exportDisabled={!isCanvasReady}
    />
  );
}

export default function CvEditorPage() {
  return (
    <Suspense fallback={<SkeletonEditor />}>
      <EditorPageContent />
    </Suspense>
  );
}
