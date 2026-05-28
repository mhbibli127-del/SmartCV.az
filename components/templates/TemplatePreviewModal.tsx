"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Crown, ZoomIn, ZoomOut, Maximize2, Type, Shield } from "lucide-react";
import type { CvEditorTemplate } from "@/types/cv-editor";
import { cn } from "@/lib/utils";

interface TemplatePreviewModalProps {
  template: CvEditorTemplate | null;
  onClose: () => void;
  onUse: (template: CvEditorTemplate) => void;
}

function TemplatePreviewModalInner({
  template,
  onClose,
  onUse,
}: TemplatePreviewModalProps) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setZoom(1);
  }, [template]);

  useEffect(() => {
    if (!template) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [template, onClose]);

  const zoomIn = useCallback(() => setZoom((z) => Math.min(2.5, z + 0.15)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(0.5, z - 0.15)), []);
  const resetZoom = useCallback(() => setZoom(1), []);

  const previewSrc =
    template?.previewImage || (template ? `/templates/${template.slug}.svg` : "");

  return (
    <AnimatePresence>
      {template && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col bg-zinc-950/95 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3 md:px-6">
            <div>
              <h2 className="text-lg font-semibold text-white">{template.name}</h2>
              <p className="text-sm text-zinc-400">
                {template.category} · {template.layout.replace(/-/g, " ")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={zoomOut}
                className="rounded-lg border border-white/10 p-2 text-zinc-300 hover:bg-white/10"
                aria-label="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="min-w-[3rem] text-center text-xs text-zinc-400">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={zoomIn}
                className="rounded-lg border border-white/10 p-2 text-zinc-300 hover:bg-white/10"
                aria-label="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={resetZoom}
                className="rounded-lg border border-white/10 p-2 text-zinc-300 hover:bg-white/10"
                aria-label="Reset zoom"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="ml-2 rounded-lg border border-white/10 p-2 text-zinc-300 hover:bg-white/10"
                aria-label="Close preview"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            <motion.div
              className="flex min-h-0 flex-1 items-start justify-center overflow-auto p-6 md:p-10"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <div
                className="origin-top transition-transform duration-200"
                style={{ transform: `scale(${zoom})` }}
              >
                <div className="relative aspect-[210/297] w-[min(520px,90vw)] overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10">
                  <Image
                    src={previewSrc}
                    alt={`${template.name} full preview`}
                    fill
                    className="object-cover object-top"
                    sizes="520px"
                    priority
                  />
                </div>
              </div>
            </motion.div>

            <aside className="shrink-0 border-t border-white/10 bg-zinc-900/60 p-6 lg:w-80 lg:border-l lg:border-t-0">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {template.premium && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-medium text-amber-300">
                      <Crown className="h-3 w-3" /> Premium
                    </span>
                  )}
                  {template.atsOptimized && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-300">
                      <Shield className="h-3 w-3" /> ATS support
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-zinc-300">{template.description}</p>
                <dl className="space-y-3 text-xs">
                  <div className="flex justify-between gap-4">
                    <dt className="text-zinc-500">Layout</dt>
                    <dd className="text-zinc-200">{template.layout}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="flex items-center gap-1 text-zinc-500">
                      <Type className="h-3 w-3" /> Heading
                    </dt>
                    <dd className="text-zinc-200">{template.fonts.heading}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-zinc-500">Body</dt>
                    <dd className="text-zinc-200">{template.fonts.body}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-zinc-500">Industry</dt>
                    <dd className="max-w-[10rem] truncate text-right text-zinc-200">
                      {template.source.industry.slice(0, 2).join(", ")}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => onUse(template)}
                  className="w-full rounded-xl bg-white py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100"
                >
                  Use This Template
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className={cn(
                    "w-full rounded-xl border border-white/15 py-3 text-sm font-medium text-zinc-300",
                    "hover:bg-white/5"
                  )}
                >
                  Close
                </button>
              </div>
            </aside>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const TemplatePreviewModal = memo(TemplatePreviewModalInner);
