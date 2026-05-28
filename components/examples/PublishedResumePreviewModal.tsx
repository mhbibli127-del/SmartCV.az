"use client";

import { memo, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { PublishedResumeItem, ResumeContent } from "@/types/resume";
import { getEditorTemplate } from "@/lib/cv-editor/template-catalog";
import { apiCanvasToCvElements } from "@/lib/cv-editor/serialize-canvas";
import { PreviewElement } from "@/components/preview/PreviewElement";
import { A4_HEIGHT, A4_WIDTH } from "@/lib/layout-engine";
import type { EditorCanvasState } from "@/types/cv-document";

interface PublishedResumePreviewModalProps {
  resume: (PublishedResumeItem & { content?: ResumeContent }) | null;
  onClose: () => void;
}

function PublishedResumePreviewModalInner({
  resume,
  onClose,
}: PublishedResumePreviewModalProps) {
  const elements = useMemo(() => {
    if (!resume?.content?.canvas) return [];
    return apiCanvasToCvElements(resume.content.canvas as EditorCanvasState);
  }, [resume]);

  const background =
    (resume?.content?.canvas as EditorCanvasState | undefined)?.background ?? "#ffffff";
  const template = resume ? getEditorTemplate(resume.templateId) : null;

  return (
    <AnimatePresence>
      {resume && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal
            className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">{resume.title}</h2>
                <p className="text-sm text-zinc-500">
                  {resume.templateName ?? template?.name ?? "Resume"} ·{" "}
                  {new Date(resume.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                aria-label="Close preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-[#e8e8ea] p-6">
              {resume.thumbnail ? (
                <div className="mx-auto max-w-[520px]">
                  <div
                    className="relative mx-auto bg-white shadow-xl"
                    style={{ width: A4_WIDTH * 0.65, height: A4_HEIGHT * 0.65 }}
                  >
                    <Image
                      src={resume.thumbnail}
                      alt={resume.title}
                      fill
                      className="object-cover object-top"
                      sizes="520px"
                    />
                  </div>
                </div>
              ) : elements.length > 0 ? (
                <div className="mx-auto flex justify-center">
                  <div
                    className="relative origin-top scale-[0.65] bg-white shadow-xl"
                    style={{ width: A4_WIDTH, height: A4_HEIGHT, background }}
                  >
                    {elements
                      .slice()
                      .sort((a, b) => a.zIndex - b.zIndex)
                      .map((el) => (
                        <PreviewElement key={el.id} element={el} />
                      ))}
                  </div>
                </div>
              ) : (
                <p className="text-center text-sm text-zinc-500">Preview unavailable.</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const PublishedResumePreviewModal = memo(PublishedResumePreviewModalInner);
