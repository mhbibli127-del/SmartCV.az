"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { StudioHeader } from "@/components/studio/StudioHeader";
import { StudioCanvasArea } from "@/components/studio/StudioCanvasArea";
import {
  cvElementsToEditorElements,
  extractResumeDataFromEditor,
  getDesignTemplateForSlug,
  normalizeTemplateSlug,
} from "@/lib/studio-template-apply";
import { getCanvasStateFromStore, useEditorStore } from "@/lib/editor-store";
import { useDesignStore } from "@/lib/design-store";
import { useToast } from "@/components/ui/use-toast";
import { createDefaultCanvas } from "@/lib/layout-engine";
import { hydrateCvData, sectionsToCanvasElements, canvasToSections } from "@/lib/cv-hydration";
import { getEditorTemplate } from "@/lib/cv-editor/template-catalog";
import { buildElementsFromTemplate } from "@/lib/cv-editor/template-catalog";
import { designSnapshot, restoreDesignFromContent } from "@/lib/design-persistence";
import { cn } from "@/lib/utils";
import { SkeletonEditor } from "@/components/ui/skeleton";
import { useStudioAutosave } from "@/components/studio/useStudioAutosave";
import { useStudioExport } from "@/components/studio/useStudioExport";
import { useCanvasReady } from "@/hooks/useCanvasReady";
import { dispatchResumeGalleryUpdate } from "@/lib/resume-gallery-events";
import type { StudioExportFormat } from "@/lib/studio-export";
import {
  draftMatchesSession,
  readStudioDraft,
  writeStudioDraft,
} from "@/lib/studio-draft";
import { syncResumeIdInUrl } from "@/lib/resume-save-client";
import type { CanvasEditorHandle } from "@/components/editor/CanvasEditor";
import type { CVContent, EditorElement } from "@/types/cv-document";
import type { ResumeContent } from "@/types/resume";

const StudioToolsPanel = dynamic(
  () => import("@/components/studio/StudioToolsPanel").then((m) => m.StudioToolsPanel),
  {
    ssr: false,
    loading: () => (
      <div className="hidden h-full w-[280px] shrink-0 animate-pulse bg-zinc-100 lg:block" />
    ),
  }
);

const PropertiesInspector = dynamic(
  () => import("@/components/studio/PropertiesInspector").then((m) => m.PropertiesInspector),
  {
    ssr: false,
    loading: () => (
      <div className="hidden h-full w-[260px] shrink-0 animate-pulse bg-zinc-50 xl:block" />
    ),
  }
);

function StudioEditorContent() {
  const router = useRouter();
  const params = useSearchParams();
  const cvId = params.get("id");
  const templateSlug = params.get("template");
  const { success, error: toastError } = useToast();
  const loadElements = useEditorStore((s) => s.loadElements);
  const markSaved = useEditorStore((s) => s.markSaved);
  const setTemplate = useDesignStore((s) => s.setTemplate);
  const hydrateDesign = useDesignStore((s) => s.hydrateDesign);
  const activeTheme = useDesignStore((s) => s.activeTheme);
  const selectedTemplate = useDesignStore((s) => s.selectedTemplate);
  const applyThemeToCanvas = useDesignStore((s) => s.applyThemeToCanvas);
  const canvasRef = useRef<CanvasEditorHandle>(null);
  const initKeyRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("Untitled CV");
  const [zoom, setZoom] = useState(0.85);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [mobileLeftOpen, setMobileLeftOpen] = useState(false);
  const [mobileRightOpen, setMobileRightOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const elements = useEditorStore((s) => s.elements);
  const isCanvasReady = useCanvasReady(canvasRef, !loading && elements.length > 0);

  const { exportDocument } = useStudioExport({
    canvasRef,
    title,
    resumeId: cvId,
    template: selectedTemplate,
    templateSlug,
    canvasReady: isCanvasReady,
    onSuccess: (msg, desc) => success(msg, desc),
    onError: (msg, desc) => toastError(msg, desc),
  });

  const handleExport = useCallback(
    async (format: StudioExportFormat) => {
      setExporting(true);
      try {
        await exportDocument(format);
      } finally {
        setExporting(false);
      }
    },
    [exportDocument]
  );

  useStudioAutosave({ resumeId: cvId, title });

  useEffect(() => {
    if (templateSlug) {
      const slug = normalizeTemplateSlug(templateSlug);
      if (!slug) return;
      const designTpl = getDesignTemplateForSlug(slug);
      if (designTpl) setTemplate(designTpl);
    }
  }, [templateSlug, setTemplate]);

  const applyTemplateBySlug = useCallback(
    (slugOrId: string, preserveContent = false) => {
      const slug = normalizeTemplateSlug(slugOrId) ?? slugOrId;
      const designTpl = getDesignTemplateForSlug(slug);
      if (designTpl) setTemplate(designTpl);

      const editorTpl = getEditorTemplate(slug);
      if (!editorTpl) return;

      const resumeData = preserveContent
        ? extractResumeDataFromEditor(getCanvasStateFromStore().elements)
        : undefined;
      const built = cvElementsToEditorElements(
        buildElementsFromTemplate(editorTpl, resumeData)
      );

      if (built.length) {
        loadElements(built);
        applyThemeToCanvas();
      }
    },
    [setTemplate, loadElements, applyThemeToCanvas]
  );

  const hydrateFromContent = useCallback(
    (content: ResumeContent, resumeTitle?: string) => {
      const sections = Array.isArray(content.sections) ? content.sections : [];
      const hydrated = hydrateCvData({
        sections,
        generatorData: content.generatorData as Record<string, unknown> | undefined,
        canvas: content.canvas,
        mode: content.mode,
      });
      const canvas = content.canvas as { elements?: EditorElement[] } | undefined;
      if (canvas?.elements?.length) {
        loadElements(canvas.elements);
      } else if (hydrated.sections?.length) {
        loadElements(sectionsToCanvasElements(hydrated.sections));
      } else {
        loadElements(createDefaultCanvas().elements);
      }
      const restored = restoreDesignFromContent(content as CVContent);
      if (restored) hydrateDesign(restored);
      if (resumeTitle) setTitle(resumeTitle);
    },
    [loadElements, hydrateDesign]
  );

  useEffect(() => {
    const initKey = `${cvId ?? "new"}|${templateSlug ?? ""}`;
    const existingElements = useEditorStore.getState().elements;

    if (initKeyRef.current === initKey && existingElements.length > 0) {
      setLoading(false);
      return;
    }

    // URL gained ?id= from autosave — skip reload (prevents replaceState → init → save loop).
    if (cvId && existingElements.length > 0 && initKeyRef.current) {
      initKeyRef.current = initKey;
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      if (cvId) {
        try {
          const res = await fetch(`/api/resumes/${cvId}`, { credentials: "include" });
          if (res.ok) {
            const data = await res.json();
            if (cancelled) return;
            const content = (data.resume?.content ?? { mode: "visual" }) as ResumeContent;
            hydrateFromContent(content, data.resume?.title ?? "Untitled CV");
            initKeyRef.current = initKey;
            setLoading(false);
            return;
          }
        } catch {
          /* fall through */
        }
      }

      const draft = readStudioDraft();
      if (draft && draftMatchesSession(draft, cvId)) {
        if (draft.elements?.length) loadElements(draft.elements);
        if (draft.designTheme) {
          hydrateDesign({
            theme: draft.designTheme,
            templateSlug: draft.selectedTemplateSlug ?? undefined,
          });
        }
        if (draft.title) setTitle(draft.title);
        if (draft.pageCount) {
          useEditorStore.setState({
            pageCount: draft.pageCount,
            activePage: 1,
          });
        }
        initKeyRef.current = initKey;
        setLoading(false);
        return;
      }

      if (templateSlug && !cvId) {
        applyTemplateBySlug(templateSlug);
        initKeyRef.current = initKey;
        setLoading(false);
        return;
      }

      loadElements(createDefaultCanvas().elements);
      initKeyRef.current = initKey;
      setLoading(false);
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [cvId, templateSlug, loadElements, hydrateDesign, hydrateFromContent, applyTemplateBySlug]);

  const persist = useCallback(async () => {
    const canvas = getCanvasStateFromStore();
    const sections = canvasToSections(canvas.elements);
    const design = designSnapshot(activeTheme, selectedTemplate);
    const tplId = selectedTemplate?.id ?? selectedTemplate?.slug ?? "tpl-minimal-corporate";
    const res = await fetch("/api/resumes/save", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resumeId: cvId ?? undefined,
        title,
        templateId: tplId,
        templateName: selectedTemplate?.title,
        content: {
          mode: "visual" as const,
          canvas,
          sections,
          designTheme: design,
        },
      }),
    });
    if (!res.ok) throw new Error("Save failed");
    const data = await res.json();
    markSaved();
    if (!cvId && data.resumeId) {
      syncResumeIdInUrl(data.resumeId, selectedTemplate?.slug ?? null);
    }
    dispatchResumeGalleryUpdate({ resumeId: data.resumeId ?? cvId ?? undefined });
    return data;
  }, [cvId, title, markSaved, activeTheme, selectedTemplate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await persist();
      writeStudioDraft({
        title,
        cvId: cvId ?? data.resumeId ?? null,
        elements: getCanvasStateFromStore().elements,
        pageCount: useEditorStore.getState().pageCount,
        designTheme: activeTheme,
        selectedTemplateSlug: selectedTemplate?.slug ?? null,
        updatedAt: Date.now(),
      });
      success("Saved", "Your resume was saved.");
    } catch {
      toastError("Save failed", "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSelectTemplate = useCallback(
    (slug: string) => {
      applyTemplateBySlug(slug, true);
      setTemplatesOpen(false);
    },
    [applyTemplateBySlug]
  );

  if (loading) return <SkeletonEditor />;

  return (
    <div className="-mx-6 flex h-[calc(100vh-32px)] flex-col md:-mx-8 md:h-screen">
      <StudioHeader
        title={title}
        onTitleChange={setTitle}
        zoom={zoom}
        onZoomIn={() => setZoom((z) => Math.min(1.25, z + 0.05))}
        onZoomOut={() => setZoom((z) => Math.max(0.5, z - 0.05))}
        onZoomReset={() => setZoom(0.85)}
        onSave={handleSave}
        onExport={handleExport}
        exporting={exporting}
        exportDisabled={!isCanvasReady || elements.length === 0}
        saving={saving}
        templatesOpen={templatesOpen}
        onToggleTemplates={() => setTemplatesOpen((v) => !v)}
        onSelectTemplate={handleSelectTemplate}
        onToggleLeftPanel={() => setMobileLeftOpen((v) => !v)}
        onToggleRightPanel={() => setMobileRightOpen((v) => !v)}
      />

      <div className="relative flex min-h-0 flex-1">
        <div
          className={cn(
            "shrink-0",
            mobileLeftOpen
              ? "absolute inset-y-0 left-0 z-20 shadow-xl lg:relative lg:shadow-none"
              : "hidden lg:block"
          )}
        >
          <StudioToolsPanel
            cvId={cvId}
            onSave={handleSave}
            onExportPdf={() => void handleExport("pdf")}
            onExportPng={() => void handleExport("png")}
            onSelectTemplate={handleSelectTemplate}
            saving={saving}
          />
        </div>
        <StudioCanvasArea canvasRef={canvasRef} zoom={zoom} />
        <div
          className={cn(
            "shrink-0",
            mobileRightOpen
              ? "absolute inset-y-0 right-0 z-20 shadow-xl xl:relative xl:shadow-none"
              : "hidden xl:block"
          )}
        >
          <PropertiesInspector cvId={cvId} />
        </div>
      </div>
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
        </div>
      }
    >
      <StudioEditorContent />
    </Suspense>
  );
}
