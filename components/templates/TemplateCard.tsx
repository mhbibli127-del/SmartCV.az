"use client";

import { memo, useState } from "react";
import { Crown } from "lucide-react";
import type { TemplateMetadata } from "@/types/design-system";
import { isAtsOptimized } from "@/lib/design-engine/core-templates";
import { cn } from "@/lib/utils";

interface TemplateCardProps {
  template: TemplateMetadata & { category?: string };
  onUse: () => void;
}

function TemplateCardInner({ template, onUse }: TemplateCardProps) {
  const [hover, setHover] = useState(false);
  const atsOptimized = isAtsOptimized(template);
  const category =
    "category" in template && template.category
      ? String(template.category)
      : template.industry[0] ?? "General";

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm transition hover:border-zinc-300 hover:shadow-md"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <div
          className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.02]"
          style={{ background: template.previewGradient }}
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />

        {template.premium && (
          <Crown
            className="absolute right-3 top-3 h-4 w-4 text-amber-400 drop-shadow"
            aria-label="Premium template"
          />
        )}

        {atsOptimized && (
          <span
            className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-emerald-700 backdrop-blur-sm"
            title={hover ? `ATS score: ${template.theme.atsScore}%` : undefined}
          >
            ATS Optimized
          </span>
        )}

        <div
          className={cn(
            "absolute inset-x-0 bottom-0 flex justify-center p-4 transition-opacity duration-200",
            hover ? "opacity-100" : "opacity-0"
          )}
        >
          <button
            type="button"
            onClick={onUse}
            className="w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-zinc-900 shadow-lg transition hover:bg-zinc-50"
          >
            Use template
          </button>
        </div>
      </div>

      <div className="px-4 py-3">
        <h3 className="text-sm font-semibold text-zinc-900">{template.title}</h3>
        <p className="mt-0.5 text-xs text-zinc-500">{category}</p>
      </div>
    </article>
  );
}

export const TemplateCard = memo(TemplateCardInner);
