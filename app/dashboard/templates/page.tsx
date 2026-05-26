"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { CORE_TEMPLATES, type CoreTemplateCategory } from "@/lib/design-engine/core-templates";
import { useDesignStore } from "@/lib/design-store";
import { useSubscription } from "@/hooks/useSubscription";
import { canAccessPremiumTemplates } from "@/lib/plan-features";
import { useAnalytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const CATEGORIES: Array<CoreTemplateCategory | "All"> = [
  "All",
  "Professional",
  "Modern",
  "Creative",
  "Executive",
];

export default function TemplatesPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CoreTemplateCategory | "All">("All");
  const setTemplate = useDesignStore((s) => s.setTemplate);
  const { plan, openUpgradeModal } = useSubscription();
  const { trackPageView, trackTemplateSelect } = useAnalytics();

  useEffect(() => {
    trackPageView("/dashboard/templates");
  }, [trackPageView]);

  const filtered = useMemo(() => {
    return CORE_TEMPLATES.filter((t) => {
      if (category !== "All" && t.category !== category) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.industry.some((i) => i.toLowerCase().includes(q))
      );
    });
  }, [category, query]);

  const handleUse = (template: (typeof CORE_TEMPLATES)[number]) => {
    if (template.premium && !canAccessPremiumTemplates(plan)) {
      openUpgradeModal();
      return;
    }
    setTemplate(template);
    trackTemplateSelect(0, template.title, template.category);
    router.push(`/dashboard/studio?template=${template.slug}`);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
          Templates
        </h1>
        <p className="max-w-lg text-sm text-zinc-500">
          Pick a design and start editing. Every layout is recruiter-ready.
        </p>
      </header>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            placeholder="Search templates…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-sm focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition",
                category === cat
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onUse={() => handleUse(template)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-zinc-200 py-16 text-center text-sm text-zinc-500">
          No templates match your search.
        </div>
      )}
    </div>
  );
}
