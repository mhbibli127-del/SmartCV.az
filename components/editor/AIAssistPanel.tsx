"use client";

import { useState } from "react";
import { Sparkles, Wand2, Target, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/page-shell";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/components/ui/use-toast";

type Props = {
  cvData: unknown;
  onApply: (updated: unknown) => void;
};

export default function AIAssistPanel({ cvData, onApply }: Props) {
  const { plan, canUseAI, openUpgradeModal, refreshSubscription } = useSubscription();
  const { success, error: toastError } = useToast();
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const requireAi = () => {
    if (!canUseAI()) {
      openUpgradeModal();
      return false;
    }
    return true;
  };

  const runEnhance = async () => {
    if (!requireAi()) return;
    setLoading("enhance");
    try {
      const res = await fetch("/api/cv/enhance", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv: cvData }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "AI_LIMIT_REACHED") openUpgradeModal();
        throw new Error(data.error || "Enhance failed");
      }
      onApply(data);
      await refreshSubscription();
      success("Enhanced", "AI improved your CV content.");
    } catch (e) {
      toastError("AI failed", e instanceof Error ? e.message : "Try again.");
    } finally {
      setLoading(null);
    }
  };

  const runOptimize = async () => {
    if (!requireAi()) return;
    if (!jobDescription.trim()) {
      toastError("Job required", "Paste a job description first.");
      return;
    }
    setLoading("optimize");
    try {
      const res = await fetch("/api/cv/optimize", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv: cvData, jobDescription }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "AI_LIMIT_REACHED") openUpgradeModal();
        throw new Error(data.error || "Optimize failed");
      }
      onApply(data);
      await refreshSubscription();
      success("Optimized", "CV tailored to the job posting.");
    } catch (e) {
      toastError("AI failed", e instanceof Error ? e.message : "Try again.");
    } finally {
      setLoading(null);
    }
  };

  const runJobMatch = async () => {
    if (!requireAi()) return;
    if (!jobDescription.trim()) {
      toastError("Job required", "Paste a job description first.");
      return;
    }
    setLoading("match");
    try {
      const res = await fetch("/api/job/match", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv: cvData, jobDescription }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "AI_LIMIT_REACHED") openUpgradeModal();
        throw new Error(data.error || "Match failed");
      }
      await refreshSubscription();
      const score = data.matchScore ?? data.score;
      success("Match score", score != null ? `${score}% match` : "Analysis complete.");
    } catch (e) {
      toastError("Match failed", e instanceof Error ? e.message : "Try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <Surface padding className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900">AI Assistant</h3>
        <p className="mt-0.5 text-xs text-zinc-500">
          {plan === "free"
            ? "Upgrade to Basic or Pro for AI features"
            : "Improve and tailor your CV"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={runEnhance} disabled={!!loading}>
          {loading === "enhance" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          Rewrite content
        </Button>
        <Button size="sm" variant="outline" onClick={runOptimize} disabled={!!loading}>
          {loading === "optimize" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Wand2 className="h-3.5 w-3.5" />
          )}
          Improve bullets
        </Button>
        <Button size="sm" variant="outline" onClick={runJobMatch} disabled={!!loading}>
          {loading === "match" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Target className="h-3.5 w-3.5" />
          )}
          Match to job
        </Button>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-600">Job posting</label>
        <textarea
          rows={4}
          placeholder="Paste job description for matching and optimization…"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="w-full rounded-[12px] border border-black/[0.08] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
        />
      </div>
    </Surface>
  );
}
