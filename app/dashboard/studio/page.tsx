"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { StudioToolsPanel } from "@/components/studio/StudioToolsPanel";
import { StudioCanvasArea } from "@/components/studio/StudioCanvasArea";
import { PropertiesInspector } from "@/components/studio/PropertiesInspector";
import { getCanvasStateFromStore, useEditorStore } from "@/lib/editor-store";
import { useDesignStore } from "@/lib/design-store";
import { useToast } from "@/components/ui/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { createDefaultCanvas } from "@/lib/layout-engine";
import { hydrateCvData, sectionsToCanvasElements, canvasToSections } from "@/lib/cv-hydration";
import { getCoreTemplateBySlug } from "@/lib/design-engine/core-templates";
import { getTemplateBySlug } from "@/lib/design-engine/template-catalog";
import { designSnapshot, restoreDesignFromContent } from "@/lib/design-persistence";
import { useAnalytics } from "@/lib/analytics";
import { canExportPng } from "@/lib/plan-features";
import { SkeletonEditor } from "@/components/ui/skeleton";
import type { CanvasEditorHandle } from "@/components/editor/CanvasEditor";

function StudioEditorContent() {
  const router = useRouter();
  const params = useSearchParams();
  const cvId = params.get("id");
  const templateSlug = params.get("template");
  const { success, error: toastError } = useToast();
  const { openUpgradeModal, plan } = useSubscription();
  const loadElements = useEditorStore((s) => s.loadElements);
  const markSaved = useEditorStore((s) => s.markSaved);
  const setTemplate = useDesignStore((s) => s.setTemplate);
  const hydrateDesign = useDesignStore((s) => s.hydrateDesign);
  const activeTheme = useDesignStore((s) => s.activeTheme);
  const selectedTemplate = useDesignStore((s) => s.selectedTemplate);
  const { trackPageView } = useAnalytics();
  const canvasRef = useRef<CanvasEditorHandle>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("Untitled CV");

  useEffect(() => {
    trackPageView("/dashboard/studio");
  }, [trackPageView]);

  useEffect(() => {
    if (templateSlug) {
      const tpl =
        getCoreTemplateBySlug(templateSlug) ?? getTemplateBySlug(templateSlug);
      if (tpl) setTemplate(tpl);
    }
  }, [templateSlug, setTemplate]);

  useEffect(() => {
    const load = async () => {
      if (!cvId) {
        loadElements(createDefaultCanvas().elements);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/cv/${cvId}`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load CV");
        const data = await res.json();
        const content = data.cv?.content ?? {};
        const hydrated = hydrateCvData({
          sections: content.sections,
          generatorData: content.generatorData,
          canvas: content.canvas,
          mode: content.mode,
        });
        const canvas = content.canvas;
        if (canvas?.elements?.length) {
          loadElements(canvas.elements);
        } else if (hydrated.sections?.length) {
          loadElements(sectionsToCanvasElements(hydrated.sections));
        } else {
          loadElements(createDefaultCanvas().elements);
        }
        const restored = restoreDesignFromContent(content);
        if (restored) hydrateDesign(restored);
        setTitle(data.cv?.title ?? "Untitled CV");
      } catch {
        toastError("Load failed", "Could not open this CV.");
        loadElements(createDefaultCanvas().elements);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [cvId, loadElements, hydrateDesign, toastError]);

  const persist = useCallback(async () => {
    const canvas = getCanvasStateFromStore();
    const sections = canvasToSections(canvas.elements);
    const design = designSnapshot(activeTheme, selectedTemplate);
    const payload = {
      title,
      content: {
        mode: "visual" as const,
        canvas,
        sections,
        designTheme: design,
      },
    };

    const url = cvId ? `/api/cv/${cvId}` : "/api/cv/save";
    const method = cvId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Save failed");
    const data = await res.json();
    markSaved();
    if (!cvId && data.cvId) {
      router.replace(`/dashboard/studio?id=${data.cvId}`);
    }
    return data;
  }, [cvId, title, markSaved, router, activeTheme, selectedTemplate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await persist();
      success("Saved", "Your resume was saved.");
    } catch {
      toastError("Save failed", "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      const canvas = getCanvasStateFromStore();
      const res = await fetch("/api/cv/export", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvData: { canvas, mode: "visual" }, title }),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/\s+/g, "_")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      success("Exported", "PDF downloaded.");
    } catch {
      toastError("Export failed", "Could not generate PDF.");
    }
  };

  const handleExportPng = () => {
    if (!canExportPng(plan)) {
      openUpgradeModal();
      return;
    }
    const dataUrl = canvasRef.current?.exportPng();
    if (!dataUrl) {
      toastError("Export failed", "Canvas not ready.");
      return;
    }
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${title.replace(/\s+/g, "_")}.png`;
    a.click();
    success("Exported", "PNG downloaded.");
  };

  if (loading) return <SkeletonEditor />;

  return (
    <div className="-mx-6 flex h-[calc(100vh-32px)] flex-col md:-mx-8 md:h-screen">
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/templates"
            className="flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-zinc-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Templates
          </Link>
          <span className="text-zinc-300">|</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="max-w-[200px] truncate bg-transparent text-sm font-semibold text-zinc-900 focus:outline-none md:max-w-xs"
          />
        </div>
        <Link
          href={cvId ? `/dashboard/builder?id=${cvId}&mode=form` : "/dashboard/builder"}
          className="text-xs text-zinc-500 hover:text-zinc-800"
        >
          Form mode
        </Link>
      </header>

      <div className="flex min-h-0 flex-1">
        <StudioToolsPanel
          cvId={cvId}
          onSave={handleSave}
          onExportPdf={handleExportPdf}
          onExportPng={handleExportPng}
          saving={saving}
        />
        <StudioCanvasArea canvasRef={canvasRef} />
        <PropertiesInspector />
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
