"use client";

import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Toolbar } from "@/components/editor/Toolbar";
import { Sidebar } from "@/components/editor/Sidebar";
import { getCanvasStateFromStore, useEditorStore } from "@/lib/editor-store";
import { useToast } from "@/components/ui/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { PageShell, PageHeader } from "@/components/ui/page-shell";
import { Button } from "@/components/ui/button";
import { createDefaultCanvas } from "@/lib/layout-engine";
import { hydrateCvData, sectionsToCanvasElements, canvasToSections } from "@/lib/cv-hydration";
import AIAssistPanel from "@/components/editor/AIAssistPanel";
import { useAnalytics } from "@/lib/analytics";

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
  const { success, error: toastError } = useToast();
  const { canUseAI, openUpgradeModal, refreshSubscription } = useSubscription();
  const loadElements = useEditorStore((s) => s.loadElements);
  const elements = useEditorStore((s) => s.elements);
  const markSaved = useEditorStore((s) => s.markSaved);
  const { trackPageView } = useAnalytics();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
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
        setTitle(data.cv?.title ?? "Untitled CV");
      } catch {
        toastError("Load failed", "Could not load this CV.");
        loadElements(createDefaultCanvas().elements);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [cvId, loadElements, toastError]);

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
        metadata: { version: 1 },
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
  }, [cvId, title, markSaved, router, openUpgradeModal]);

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

  const handleAiApply = (updated: unknown) => {
    const data = updated as Record<string, unknown>;
    const improved = String(data.summary ?? data.optimizedSummary ?? "").trim();
    if (!improved) return;

    const state = useEditorStore.getState();
    const next = state.elements.map((el) => {
      if (el.type === "section" && el.sectionType === "summary") {
        return { ...el, content: improved };
      }
      if (el.id === "section-summary") return { ...el, content: improved };
      return el;
    });
    loadElements(next);
    refreshSubscription();
    success("AI updated", "Content applied to canvas.");
  };

  const cvDataForAi = {
    mode: "visual" as const,
    canvas: { elements },
    summary: elements
      .filter((e) => e.text || e.content)
      .map((e) => e.text ?? e.content)
      .join("\n"),
  };

  const handleAiRewrite = async () => {
    if (!canUseAI()) {
      openUpgradeModal();
      return;
    }
    setAiLoading(true);
    try {
      const state = useEditorStore.getState();
      const canvas = getCanvasStateFromStore();
      const textBlocks = canvas.elements
        .filter((e) => e.text || e.content)
        .map((e) => e.text ?? e.content)
        .join("\n");

      const res = await fetch("/api/cv/enhance", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cv: { summary: textBlocks, mode: "visual" },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "AI_LIMIT_REACHED") openUpgradeModal();
        throw new Error(data.error || "AI failed");
      }

      const improved = String(data.summary ?? data.name ?? textBlocks).slice(0, 500);
      const targetId =
        state.selectedId ??
        canvas.elements.find((e) => e.id === "heading-title")?.id ??
        canvas.elements.find((e) => e.type === "text")?.id;

      const next = state.elements.map((el) => {
        if (el.id === targetId) {
          return { ...el, text: improved };
        }
        if (el.type === "section" && el.sectionType === "summary") {
          return { ...el, content: improved };
        }
        return el;
      });
      loadElements(next);
      await refreshSubscription();
      success("AI updated", "Content improved.");
    } catch (e) {
      toastError("AI failed", e instanceof Error ? e.message : "Try again.");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <EditorLoading />;

  return (
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
        saving={saving}
        onAiRewrite={handleAiRewrite}
        aiLoading={aiLoading}
      />

      <div className="flex min-h-[calc(100vh-280px)] gap-4">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <CanvasEditor />
          <AIAssistPanel cvData={cvDataForAi} onApply={handleAiApply} />
        </div>
      </div>
    </PageShell>
  );
}

export default function VisualEditorPage() {
  return (
    <Suspense fallback={<EditorLoading />}>
      <VisualEditorContent />
    </Suspense>
  );
}
