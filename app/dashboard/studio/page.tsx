"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Crown, Sparkles, Zap } from "lucide-react";
import { TemplateFilterBar } from "@/components/design/TemplateFilterBar";
import { DesignCustomizationPanel } from "@/components/design/DesignCustomizationPanel";
import { AICopilot } from "@/components/design/AICopilot";
import { filterTemplates } from "@/lib/design-engine/template-catalog";
import { useDesignStore } from "@/lib/design-store";
import type { TemplateFilters, TemplateMetadata } from "@/types/design-system";
import { useSubscription } from "@/hooks/useSubscription";
import { canAccessPremiumTemplates } from "@/lib/plan-features";
import { useAnalytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";

function TemplateCard({
  template,
  selected,
  onSelect,
}: {
  template: TemplateMetadata;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      layout
      onClick={onSelect}
      className={cn(
        "group relative overflow-hidden rounded-2xl border text-left transition-all duration-300",
        selected
          ? "border-violet-500/60 ring-2 ring-violet-500/30"
          : "border-white/10 hover:border-white/25"
      )}
      whileHover={{ y: -4 }}
    >
      <div
        className="aspect-[3/4] w-full"
        style={{ background: template.previewGradient }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-white">{template.title}</p>
            <p className="mt-0.5 text-xs text-zinc-400">
              {template.industry.slice(0, 2).join(" · ")}
            </p>
          </div>
          {template.premium && (
            <Crown className="h-4 w-4 shrink-0 text-amber-400" aria-label="Premium" />
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
            ATS {template.theme.atsScore}
          </span>
          {template.animated && (
            <span className="rounded-md bg-violet-500/20 px-2 py-0.5 text-[10px] font-medium text-violet-300">
              Animated
            </span>
          )}
          <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] capitalize text-zinc-300">
            {template.theme.aesthetic}
          </span>
        </div>
      </div>
    </motion.button>
  );
}

export default function DesignStudioPage() {
  const [filters, setFilters] = useState<TemplateFilters>({});
  const selectedTemplate = useDesignStore((s) => s.selectedTemplate);
  const setTemplate = useDesignStore((s) => s.setTemplate);
  const liveAtsScore = useDesignStore((s) => s.liveAtsScore);
  const { trackPageView } = useAnalytics();
  const { plan, openUpgradeModal } = useSubscription();

  useEffect(() => {
    trackPageView("/dashboard/studio");
  }, [trackPageView]);

  const templates = useMemo(() => filterTemplates(filters), [filters]);

  const handleSelect = useCallback(
    (t: TemplateMetadata) => {
      if (t.premium && !canAccessPremiumTemplates(plan)) {
        openUpgradeModal();
        return;
      }
      setTemplate(t);
    },
    [setTemplate, plan, openUpgradeModal]
  );

  return (
    <div className="studio-shell -mx-6 min-h-[calc(100vh-120px)] space-y-6 px-6 md:-mx-8 md:px-8">
      <div className="relative overflow-hidden rounded-2xl border border-black/[0.08] bg-zinc-950 px-6 py-8 md:px-10">
        <div className="relative z-10 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
            Templates
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Choose your design
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Recruiter-ready layouts with live ATS scoring. Apply instantly to your CV.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="rounded-xl bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-400">
              Live ATS {liveAtsScore}%
            </div>
            <Link
              href={
                selectedTemplate
                  ? `/dashboard/builder/editor?template=${selectedTemplate.slug}`
                  : "/dashboard/builder/editor"
              }
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
            >
              Open visual editor
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <TemplateFilterBar
        filters={filters}
        onChange={setFilters}
        resultCount={templates.length}
      />

      <div className="flex flex-col gap-6 lg:flex-row">
        <DesignCustomizationPanel />

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-200">Template library</h2>
            <span className="flex items-center gap-1 text-xs text-zinc-500">
              <Zap className="h-3.5 w-3.5 text-violet-400" />
              Realtime preview
            </span>
          </div>

          <motion.div
            layout
            className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4"
          >
            {templates.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                selected={selectedTemplate?.id === t.id}
                onSelect={() => handleSelect(t)}
              />
            ))}
          </motion.div>

          {templates.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center text-sm text-zinc-500">
              No templates match your filters. Try broadening your search.
            </div>
          )}
        </div>
      </div>

      <AICopilot />
    </div>
  );
}
