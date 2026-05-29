"use client";

import { memo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Eye, FileText } from "lucide-react";
import type { PublishedResumeItem } from "@/types/resume";
import { getEditorTemplate } from "@/lib/cv-editor/template-catalog";
import { TemplateCanvasPreview } from "@/components/preview/TemplateCanvasPreview";
import { cn } from "@/lib/utils";

interface PublishedResumeCardProps {
  resume: PublishedResumeItem;
  onPreview: (resume: PublishedResumeItem) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function PublishedResumeCardInner({ resume, onPreview }: PublishedResumeCardProps) {
  const template = getEditorTemplate(resume.templateId);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm hover:border-zinc-300 hover:shadow-lg"
    >
      <button
        type="button"
        onClick={() => onPreview(resume)}
        className="relative block w-full overflow-hidden bg-zinc-100 text-left"
      >
        {resume.thumbnail ? (
          <div className="relative aspect-[210/297] w-full">
            <Image
              src={resume.thumbnail}
              alt={resume.title}
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          </div>
        ) : template ? (
          <TemplateCanvasPreview template={template} className="rounded-none" showShadow={false} />
        ) : (
          <div className="flex aspect-[210/297] items-center justify-center text-zinc-400">
            <FileText className="h-8 w-8" />
          </div>
        )}

        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20"
          )}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-zinc-900 opacity-0 shadow transition group-hover:opacity-100">
            <Eye className="h-3.5 w-3.5" />
            Preview
          </span>
        </div>
      </button>

      <div className="space-y-1 p-4">
        <h3 className="truncate text-sm font-semibold text-zinc-900">{resume.title}</h3>
        <p className="truncate text-xs text-zinc-500">
          {resume.templateName ?? "Resume template"}
        </p>
        <p className="text-[11px] text-zinc-400" suppressHydrationWarning>
          Published {formatDate(resume.createdAt)}
        </p>
      </div>
    </motion.article>
  );
}

export const PublishedResumeCard = memo(PublishedResumeCardInner);
