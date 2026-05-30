"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { TemplateCard } from "@/components/templates/TemplateCard";
import {
  EDITOR_TEMPLATES,
} from "@/lib/cv-editor/template-catalog";
import type { CoreTemplateCategory } from "@/lib/design-engine/core-templates";
import type { CvEditorTemplate } from "@/types/cv-editor";
import { useAnalytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { preloadImage } from "@/lib/wait-for-images";
import { getTemplatePreviewSrc } from "@/lib/cv-editor/template-base-layer";
import { clearEntireEditorState } from "@/lib/template-engine/reset";
import { clearStudioDraft } from "@/lib/studio-draft";

const TemplatePreviewModal = dynamic(
  () => import("@/components/templates/TemplatePreviewModal").then((m) => m.TemplatePreviewModal),
  { ssr: false }
);

const CATEGORIES: Array<CoreTemplateCategory | "All"> = [
  "All",
  "Professional",
  "Modern",
  "Executive",
  "Creative",
];

export default function TemplatesPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CoreTemplateCategory | "All">("All");
  const [previewTemplate, setPreviewTemplate] = useState<CvEditorTemplate | null>(null);
  const { trackTemplateSelect } = useAnalytics();

  const filtered = useMemo(() => {
    return EDITOR_TEMPLATES.filter((t) => {
      if (category !== "All" && t.category !== category) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.source.industry.some((i) => i.toLowerCase().includes(q))
      );
    });
  }, [category, query]);

  const openEditor = async (template: CvEditorTemplate) => {
    trackTemplateSelect(0, template.name, template.category);
    clearEntireEditorState();
    clearStudioDraft();
    await preloadImage(getTemplatePreviewSrc(template), getTemplatePreviewSrc(template));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    router.push(`/dashboard/studio?template=${encodeURIComponent(template.slug)}`);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      <header className="space-y-2">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl"
        >
          CV Templates
        </motion.h1>
        <p className="max-w-xl text-sm text-zinc-500">
          Professional, recruiter-ready designs. Pick a template and edit in our Canva-style builder.
        </p>
      </header>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            placeholder="Search templates…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-sm transition focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full px-4 py-2 text-xs font-medium transition",
                category === cat
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((template, index) => (
          <TemplateCard
            key={template.id}
            template={template}
            priority={index < 4}
            onUse={() => openEditor(template)}
            onPreview={() => setPreviewTemplate(template)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-zinc-200 py-20 text-center text-sm text-zinc-500">
          No templates match your search.
        </div>
      )}

      <TemplatePreviewModal
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onUse={(t) => {
          setPreviewTemplate(null);
          openEditor(t);
        }}
      />
    </div>
  );
}
