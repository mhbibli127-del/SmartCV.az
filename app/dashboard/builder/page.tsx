"use client";
import React, { useState, useEffect } from "react";
import { BuilderProvider, useBuilder } from "@/lib/builder-state";
import BuilderHeader from "@/components/builder/BuilderHeader";
import BuilderSidebar from "@/components/builder/BuilderSidebar";
import BuilderCanvas from "@/components/builder/BuilderCanvas";
import { logger } from "@/lib/logger";
import { useAnalytics } from "@/lib/analytics";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api-client";
import { useSubscription } from "@/hooks/useSubscription";

function BuilderContent() {
  const { cvData, setCvData, setSaving, setLastSaved, resetBuilder } = useBuilder();
  const [loading, setLoading] = useState(true);
  const { trackPageView } = useAnalytics();
  const { success, error: toastError } = useToast();
  const { openUpgradeModal, refreshSubscription } = useSubscription();

  useEffect(() => {
    trackPageView('/dashboard/builder');
  }, [trackPageView]);

  useEffect(() => {
    const fetchCVData = async () => {
      try {
        const { ok, data } = await api.get<{ cvData: typeof cvData }>("/api/cv/current");
        if (ok && data.cvData) {
          setCvData(data.cvData);
          logger.info('CV data loaded from database', 'builder');
        }
      } catch (err) {
        logger.error('Failed to fetch CV data:', 'builder', err as Error);
        toastError("Load failed", "Could not load your saved CV.");
      } finally {
        setLoading(false);
      }
    };

    fetchCVData();
  }, [setCvData, toastError]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { ok, status, data } = await api.post<{
        message?: string;
        error?: string;
        code?: string;
        upgradeRequired?: boolean;
      }>("/api/cv/save", {
        cvData,
        status: "draft",
      });
      if (ok) {
        setLastSaved(new Date());
        success("CV saved", data.message || "Your changes were saved.");
        logger.info('CV saved successfully', 'builder');
        // Refresh subscription so the new CV count is reflected in the UI.
        refreshSubscription();
      } else if (status === 401) {
        toastError("Save failed", "Please sign in and try again.");
      } else if (status === 403 && data?.code === "CV_LIMIT_REACHED") {
        toastError(
          "Free plan limit reached",
          data.error || "Upgrade to Pro to save more CVs."
        );
        openUpgradeModal();
      } else {
        toastError("Save failed", data?.error || "Please try again.");
      }
    } catch (err) {
      logger.error('Failed to save CV:', 'builder', err as Error);
      toastError("Save failed", "Something went wrong while saving.");
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
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "my-resume.pdf";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        await api.post("/api/cv/complete", { cvData });
        success("Resume ready", "Your CV was exported and marked as completed.");
        logger.info('CV exported successfully', 'builder');
      } else {
        toastError("Export failed", "Could not generate PDF.");
      }
    } catch (err) {
      logger.error('Failed to export CV:', 'builder', err as Error);
      toastError("Export failed", "Something went wrong during export.");
    }
  };

  const handlePreview = () => {
    window.open(`/dashboard/builder/preview?cv=${encodeURIComponent(JSON.stringify(cvData))}`, "_blank");
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the builder? All unsaved changes will be lost.')) {
      resetBuilder();
      logger.info('Builder reset', 'builder');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-140px)]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CV Builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <BuilderHeader 
        onSave={handleSave}
        onExport={handleExport}
        onPreview={handlePreview}
        onReset={handleReset}
      />
      
      <div className="flex-1 flex gap-6 overflow-hidden">
        <BuilderSidebar />
        <BuilderCanvas />
      </div>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <BuilderProvider>
      <BuilderContent />
    </BuilderProvider>
  );
}
