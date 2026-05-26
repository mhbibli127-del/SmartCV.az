"use client";

import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Toolbar } from "@/components/editor/Toolbar";
import { CanvaSidebar } from "@/components/editor/CanvaSidebar";
import { getCanvasStateFromStore, useEditorStore } from "@/lib/editor-store";
import { useToast } from "@/components/ui/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { PageShell, PageHeader } from "@/components/ui/page-shell";
import { Button } from "@/components/ui/button";
import { createDefaultCanvas } from "@/lib/layout-engine";
import { hydrateCvData, sectionsToCanvasElements, canvasToSections } from "@/lib/cv-hydration";
import { AICopilot } from "@/components/design/AICopilot";
import { getTemplateBySlug } from "@/lib/design-engine/template-catalog";
import { useDesignStore } from "@/lib/design-store";
import { designSnapshot, restoreDesignFromContent } from "@/lib/design-persistence";
import { useAnalytics } from "@/lib/analytics";
import { useCollabSession } from "@/hooks/useCollabSession";
import { useCurrentUser, displayNameOf } from "@/hooks/useCurrentUser";
import { CollabBar } from "@/components/realtime/CollabBar";
import { FloatingToolbar } from "@/components/editor/FloatingToolbar";
import { EditorRulers } from "@/components/editor/EditorRulers";
import { LiveblocksRoom } from "@/components/realtime/LiveblocksRoom";
import { SkeletonEditor } from "@/components/ui/skeleton";
import { canUseCollab, canExportPng } from "@/lib/plan-features";
import type { CanvasEditorHandle } from "@/components/editor/CanvasEditor";

const CanvasEditor = dynamic(
  () => import("@/components/editor/CanvasEditor").then((m) => m.CanvasEditor),
  { ssr: false, loading: () => <EditorLoading /> }
);

function EditorLoading() {
  return (
    <div className="flex flex-1 items-center justify-center rounded-[14px] border border-black/[0.08] bg-zinc-50 py-32">
      <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
    </div>
  );
}

function VisualEditorContent() {
  const router = useRouter();
  const params = useSearchParams();
  const cvId = params.get("id");
  const templateSlug = params.get("template");
  const { success, error: toastError } = useToast();
  const { openUpgradeModal, plan } = useSubscription();
  const loadElements = useEditorStore((s) => s.loadElements);
  const elements = useEditorStore((s) => s.elements);
  const markSaved = useEditorStore((s) => s.markSaved);
  const setTemplate = useDesignStore((s) => s.setTemplate);
  const hydrateDesign = useDesignStore((s) => s.hydrateDesign);
  const activeTheme = useDesignStore((s) => s.activeTheme);
  const selectedTemplate = useDesignStore((s) => s.selectedTemplate);
  const refreshLiveScores = useDesignStore((s) => s.refreshLiveScores);
  const { user } = useCurrentUser();
  const canvasRef = useRef<CanvasEditorHandle>(null);
  const { presence, connected } = useCollabSession(
    cvId,
    user?.email ?? null,
    user ? displayNameOf(user) : undefined
  );
  const { trackPageView } = useAnalytics();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("Untitled CV");

  useEffect(() => {
    trackPageView("/dashboard/builder/editor");
  }, [trackPageView]);

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
        toastError("Load failed", "Could not load this CV.");
        loadElements(createDefaultCanvas().elements);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [cvId, loadElements, toastError, hydrateDesign]);

  useEffect(() => {
    if (!templateSlug || loading) return;
    const template = getTemplateBySlug(templateSlug);
    if (template) setTemplate(template);
  }, [templateSlug, loading, setTemplate]);

  useEffect(() => {
    refreshLiveScores();
  }, [elements.length, refreshLiveScores]);

  const persist = useCallback(async () => {
    const canvas = getCanvasStateFromStore();
    const sections = canvasToSections(canvas.elements);
    const payload = {
      cvId,
      title,
      cvData: {
        mode: "visual",
        canvas,
        sections,
        designTheme: designSnapshot(activeTheme, selectedTemplate),
        metadata: { version: 2 },
      },
      status: "draft",
    };

    const res = await fetch("/api/cv/save", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.code === "CV_LIMIT_REACHED") openUpgradeModal();
      throw new Error(data.error || "Save failed");
    }
    markSaved();
    if (!cvId && data.cvId) {
      router.replace(`/dashboard/builder/editor?id=${data.cvId}`);
    }
    return data;
  }, [cvId, title, markSaved, router, openUpgradeModal, activeTheme, selectedTemplate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await persist();
      success("Saved", "Visual CV saved.");
    } catch (e) {
      toastError("Save failed", e instanceof Error ? e.message : "Try again.");
    } finally {
      setSaving(false);
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

  const handleExport = async () => {
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
      if (cvId) {
        await fetch("/api/cv/complete", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cvId }),
        });
      }
      success("Exported", "PDF downloaded.");
    } catch {
      toastError("Export failed", "Could not generate PDF.");
    }
  };

  if (loading) return <SkeletonEditor />;

  return (
    <LiveblocksRoom cvId={cvId}>
    <PageShell className="space-y-4">
      <PageHeader
        eyebrow="Visual editor"
        title={title}
        description="Drag, resize, and layer elements on an A4 canvas."
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href={cvId ? `/dashboard/builder?id=${cvId}&mode=form` : "/dashboard/builder"}>
              <ArrowLeft className="h-3.5 w-3.5" />
              Form mode
            </Link>
          </Button>
        }
      />

      <Toolbar
        onSave={handleSave}
        onExport={handleExport}
        onExportPng={handleExportPng}
        saving={saving}
      />

      <CollabBar presence={presence} connected={connected} enabled={Boolean(cvId) && canUseCollab(plan)} />

      <div className="flex min-h-[calc(100vh-280px)] gap-4">
        <CanvaSidebar cvId={cvId} />
        <div className="relative flex min-w-0 flex-1 flex-col gap-4">
          <EditorRulers width={794} height={1123} />
          <FloatingToolbar />
          <CanvasEditor ref={canvasRef} />
        </div>
      </div>

      <AICopilot />
    </PageShell>
    </LiveblocksRoom>
  );
}

export default function VisualEditorPage() {
  return (
    <Suspense fallback={<EditorLoading />}>
      <VisualEditorContent />
    </Suspense>
  );
}
