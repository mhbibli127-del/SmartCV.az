"use client";

import { Suspense, useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { StudioHeader } from "@/components/studio/StudioHeader";
import { StudioCanvasArea } from "@/components/studio/StudioCanvasArea";
import { getCanvasStateFromStore, useEditorStore } from "@/lib/editor-store";
import { useDesignStore } from "@/lib/design-store";
import { useToast } from "@/components/ui/use-toast";
import { canvasToSections } from "@/lib/cv-hydration";
import { isResumeDbAvailable, markResumeDbUnavailable } from "@/lib/resume-db-client";
import { designSnapshot } from "@/lib/design-persistence";
import { cn } from "@/lib/utils";
import { SkeletonEditor } from "@/components/ui/skeleton";
import { useStudioAutosave } from "@/components/studio/useStudioAutosave";
import { useStudioExport } from "@/components/studio/useStudioExport";
import { useCanvasReady } from "@/hooks/useCanvasReady";
import { useStudioHydration } from "@/hooks/useStudioHydration";
import { dispatchResumeGalleryUpdate } from "@/lib/resume-gallery-events";
import type { StudioExportFormat } from "@/lib/studio-export";
import { writeStudioDraft } from "@/lib/studio-draft";
import { syncResumeIdInUrl } from "@/lib/resume-save-client";
import type { CanvasEditorHandle } from "@/components/editor/CanvasEditor";

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
  const params = useSearchParams();
  const cvId = params.get("id");
  const templateSlug = params.get("template");
  const { success, error: toastError } = useToast();
  const markSaved = useEditorStore((s) => s.markSaved);
  const activeTheme = useDesignStore((s) => s.activeTheme);
  const selectedTemplate = useDesignStore((s) => s.selectedTemplate);
  const canvasRef = useRef<CanvasEditorHandle>(null);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("Untitled CV");
  const [zoom, setZoom] = useState(0.85);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [mobileLeftOpen, setMobileLeftOpen] = useState(false);
  const [mobileRightOpen, setMobileRightOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { isHydrating, isReady, sessionKey, renderVersion, elements, switchTemplate } =
    useStudioHydration({
      cvId,
      templateSlug,
      title,
      onTitle: setTitle,
    });

  const isCanvasReady = useCanvasReady(canvasRef, isReady && elements.length > 0);

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

  const persist = useCallback(async () => {
    const dbOk = await isResumeDbAvailable();
    if (!dbOk) {
      markResumeDbUnavailable();
      throw new Error("DATABASE_OFFLINE");
    }

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
    if (!res.ok) {
      if (res.status === 503) markResumeDbUnavailable();
      throw new Error("Save failed");
    }
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
    } catch (err) {
      if (err instanceof Error && err.message === "DATABASE_OFFLINE") {
        toastError("Saved locally", "Database is offline — your draft is kept in this browser.");
      } else {
        toastError("Save failed", "Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSelectTemplate = useCallback(
    (slug: string) => {
      void switchTemplate(slug, true).then((ok) => {
        if (ok) setTemplatesOpen(false);
      });
    },
    [switchTemplate]
  );

  const canvasKey = `${sessionKey}-${renderVersion}`;

  if (isHydrating || !isReady) {
    return <SkeletonEditor />;
  }

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
        {elements.length > 0 && (
          <StudioCanvasArea
            key={canvasKey}
            canvasKey={canvasKey}
            canvasRef={canvasRef}
            zoom={zoom}
          />
        )}
        <div
          className={cn(
            "shrink-0",
            mobileRightOpen
              ? "absolute inset-y-0 right-0 z-20 shadow-xl xl:relative xl:shadow-none"
              : "hidden xl:block"
          )}
        >
          <PropertiesInspector key={canvasKey} cvId={cvId} />
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
