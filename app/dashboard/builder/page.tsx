"use client";

import React, { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BuilderProvider, useBuilder } from "@/lib/builder-state";
import { useAnalytics } from "@/lib/analytics";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api-client";
import { useSubscription } from "@/hooks/useSubscription";
import BuilderHeader from "@/components/builder/BuilderHeader";
import BuilderSidebar from "@/components/builder/BuilderSidebar";
import BuilderCanvas from "@/components/builder/BuilderCanvas";
import { AICopilot } from "@/components/design/AICopilot";
import { logger } from "@/lib/logger";
import { LoadingState } from "@/components/ui/states";
import {
  hydrateCvData,
  readExampleImport,
  exampleContentToSections,
} from "@/lib/cv-hydration";

function BuilderContent() {
  const params = useSearchParams();
  const router = useRouter();
  const cvIdParam = params.get("id");
  const modeForm = params.get("mode") === "form";
  const { cvData, setCvData, setSaving, setLastSaved, resetBuilder } = useBuilder();
  const [cvId, setCvId] = useState<string | null>(cvIdParam);
  const [loading, setLoading] = useState(true);
  const { trackPageView, trackCVCreation } = useAnalytics();
  const { success, error: toastError } = useToast();
  const { openUpgradeModal, refreshSubscription } = useSubscription();

  useEffect(() => {
    trackPageView("/dashboard/builder");
  }, [trackPageView]);

  useEffect(() => {
    setCvId(cvIdParam);
  }, [cvIdParam]);

  useEffect(() => {
    let cancelled = false;
    const fetchCVData = async () => {
      setLoading(true);
      try {
        const url = cvIdParam
          ? `/api/cv/current?id=${encodeURIComponent(cvIdParam)}`
          : "/api/cv/current";
        const { ok, data } = await api.get<{
          cvData: typeof cvData & { mode?: string };
        }>(url);
        if (cancelled) return;
        if (ok && data.cvData) {
          if (data.cvData.mode === "visual" && data.cvData.id && !modeForm) {
            router.replace(`/dashboard/builder/editor?id=${data.cvData.id}`);
            return;
          }
          let loaded = hydrateCvData({
            id: data.cvData.id,
            templateId: data.cvData.templateId,
            templateName: data.cvData.templateName,
            sections: data.cvData.sections,
            generatorData: (data.cvData as { generatorData?: Record<string, unknown> }).generatorData,
            mode: data.cvData.mode === "visual" ? "visual" : "form",
          });
          const exampleImport = readExampleImport();
          if (exampleImport?.cvContent) {
            loaded = {
              ...loaded,
              sections: exampleContentToSections(exampleImport),
              templateName: exampleImport.template,
            };
          }
          setCvData({
            ...loaded,
            metadata: data.cvData.metadata ?? { version: 1 },
          });
          if (loaded.id) setCvId(loaded.id);
          logger.info("CV loaded", "builder");
        } else if (!cvIdParam) {
          const exampleImport = readExampleImport();
          if (exampleImport?.cvContent) {
            setCvData({
              ...cvData,
              sections: exampleContentToSections(exampleImport),
              templateName: exampleImport.template,
            });
          }
        }
      } catch (err) {
        if (!cancelled) {
          logger.error("Failed to fetch CV:", "builder", err as Error);
          toastError("Load failed", "Could not load your CV.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchCVData();
    return () => {
      cancelled = true;
    };
  }, [cvIdParam, modeForm, setCvData, toastError, router]);

  const handleOpenVisual = useCallback(async () => {
    if (cvId) {
      router.push(`/dashboard/builder/editor?id=${cvId}`);
      return;
    }
    setSaving(true);
    try {
      const { ok, data } = await api.post<{ cvId?: string }>("/api/cv/save", {
        cvId,
        cvData,
        status: "draft",
      });
      if (ok && data?.cvId) {
        setCvId(data.cvId);
        router.push(`/dashboard/builder/editor?id=${data.cvId}`);
      } else {
        toastError("Save required", "Save your CV before opening the visual editor.");
      }
    } catch {
      toastError("Save failed", "Could not open visual editor.");
    } finally {
      setSaving(false);
    }
  }, [cvId, cvData, router, setSaving, toastError]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { ok, status, data } = await api.post<{
        message?: string;
        error?: string;
        code?: string;
        cvId?: string;
      }>("/api/cv/save", {
        cvId,
        cvData,
        status: "draft",
      });
      if (ok) {
        setLastSaved(new Date());
        if (data.cvId) setCvId(data.cvId);
        trackCVCreation(Number(cvData.templateId) || 1, cvData);
        success("CV saved", data.message || "Your changes were saved.");
        refreshSubscription();
      } else if (status === 403 && data?.code === "CV_LIMIT_REACHED") {
        toastError("Limit reached", data.error || "Upgrade to create more CVs.");
        openUpgradeModal();
      } else {
        toastError("Save failed", data?.error || "Please try again.");
      }
    } catch {
      toastError("Save failed", "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/api/cv/export", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvData }),
      });
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-resume.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
      await api.post("/api/cv/complete", { cvId, cvData });
      success("Exported", "PDF downloaded.");
    } catch {
      toastError("Export failed", "Could not generate PDF.");
    }
  };

  const handlePreview = () => {
    window.open(
      `/dashboard/builder/preview?cv=${encodeURIComponent(JSON.stringify(cvData))}`,
      "_blank"
    );
  };

  const handleReset = () => {
    if (confirm("Reset the builder? Unsaved changes will be lost.")) {
      resetBuilder();
    }
  };

  if (loading) {
    return <LoadingState label="Loading CV Builder…" />;
  }

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col space-y-6">
      <BuilderHeader
        cvId={cvId}
        onSave={handleSave}
        onExport={handleExport}
        onPreview={handlePreview}
        onReset={handleReset}
        onOpenVisual={handleOpenVisual}
      />

      <div className="flex flex-1 gap-6 overflow-hidden">
        <BuilderSidebar />
        <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-hidden">
          <BuilderCanvas />
        </div>
      </div>
      <AICopilot />
    </div>
  );
}

export default function BuilderPage() {
  return (
    <BuilderProvider>
      <Suspense fallback={<LoadingState label="Loading…" />}>
        <BuilderContent />
      </Suspense>
    </BuilderProvider>
  );
}
