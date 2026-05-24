"use client";

import { useState } from "react";
import { ArrowRight, Layers, Sparkles } from "lucide-react";
import PanelCard from "@/components/PanelCard";
import type { CVData } from "@/types/cv";

type PortfolioPreviewProps = {
  cv: CVData;
};

type PortfolioPreviewResult = {
  projects: string[];
  websiteSections: string[];
};

export default function PortfolioPreview({ cv }: PortfolioPreviewProps) {
  const [result, setResult] = useState<PortfolioPreviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("Generate website content and project ideas from your CV.");

  const handleBuild = async () => {
    if (!cv.name) {
      setMessage("Build your CV first to create portfolio material.");
      return;
    }

    setLoading(true);
    setMessage("Generating portfolio ideas...");

    try {
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv }),
      });
      const payload = await response.json();
      setResult(payload as PortfolioPreviewResult);
      setMessage("Portfolio preview created.");
    } catch {
      setResult(null);
      setMessage("Portfolio generation failed. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PanelCard
      title="Portfolio Generator"
      description="Turn your CV into a polished portfolio statement and project roadmap."
      badge="Portfolio"
      actions={
        <button
          type="button"
          disabled={loading}
          onClick={handleBuild}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-slate-900 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Generating…" : "Build portfolio"}
          <ArrowRight size={16} />
        </button>
      }
    >
      <p className="text-sm text-slate-500">{message}</p>
      {result ? (
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-950/5 p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Website sections</p>
            <div className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              {result.websiteSections.map((section) => (
                <p key={section}>{section}</p>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Project ideas</p>
            <div className="mt-3 grid gap-3">
              {result.projects.map((idea) => (
                <div key={idea} className="rounded-3xl bg-white/90 p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                    <Layers size={16} />
                    {idea}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </PanelCard>
  );
}
