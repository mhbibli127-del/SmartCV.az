"use client";

import { memo, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Eye, Type } from "lucide-react";
import type { CvEditorTemplate } from "@/types/cv-editor";
import { CvTemplateThumbnail } from "@/components/templates/CvTemplateThumbnail";
import { cn } from "@/lib/utils";

interface TemplateCardProps {
  template: CvEditorTemplate;
  onUse: () => void;
  onPreview: () => void;
  priority?: boolean;
}

function TemplateCardInner({ template, onUse, onPreview, priority }: TemplateCardProps) {
  const [hover, setHover] = useState(false);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm transition-shadow hover:border-zinc-300 hover:shadow-xl"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="relative p-3 pb-0">
        <motion.div
          className="overflow-hidden rounded-xl ring-1 ring-zinc-100"
          animate={{ scale: hover ? 1.02 : 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <CvTemplateThumbnail template={template} priority={priority} />
        </motion.div>

        <span className="absolute left-5 top-5 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 shadow-sm backdrop-blur">
          {template.category}
        </span>

        {template.premium && (
          <span className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
            <Crown className="h-3 w-3" />
            Premium
          </span>
        )}

        {template.atsOptimized && !template.premium && (
          <span className="absolute right-5 top-5 rounded-full bg-emerald-500/95 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
            ATS
          </span>
        )}

        <motion.div
          className={cn(
            "absolute inset-x-3 bottom-3 flex gap-2 p-2",
            hover ? "opacity-100" : "pointer-events-none opacity-0"
          )}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            onClick={onPreview}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/30 bg-white/95 py-2.5 text-sm font-medium text-zinc-800 shadow-lg backdrop-blur hover:bg-white"
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <button
            type="button"
            onClick={onUse}
            className="flex-1 rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-zinc-800"
          >
            Use Template
          </button>
        </motion.div>
      </div>

      <div className="space-y-1 px-4 py-3">
        <h3 className="text-sm font-semibold text-zinc-900">{template.name}</h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500">
          {template.description}
        </p>
        <p className="flex items-center gap-1 pt-1 text-[11px] text-zinc-400">
          <Type className="h-3 w-3" />
          {template.fonts?.heading ?? "Inter"}
        </p>
      </div>
    </motion.article>
  );
}

export const TemplateCard = memo(TemplateCardInner);
