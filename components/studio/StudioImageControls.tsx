"use client";

import { memo } from "react";
import { useEditorStore } from "@/lib/editor-store";
import MediaUploadDropzone from "@/components/media/MediaUploadDropzone";
import { cn } from "@/lib/utils";
import { useDesignStore } from "@/lib/design-store";
import {
  getTemplatePreviewSrc,
  isTemplateBaseImage,
} from "@/lib/cv-editor/template-base-layer";
import { getEditorTemplate } from "@/lib/cv-editor/template-catalog";

interface StudioImageControlsProps {
  cvId?: string | null;
  compact?: boolean;
}

function StudioImageControlsInner({ cvId, compact }: StudioImageControlsProps) {
  const selectedId = useEditorStore((s) => s.selectedId);
  const elements = useEditorStore((s) => s.elements);
  const updateElement = useEditorStore((s) => s.updateElement);
  const removeElement = useEditorStore((s) => s.removeElement);
  const addImageElement = useEditorStore((s) => s.addImageElement);

  const selected = elements.find((e) => e.id === selectedId);
  const imageEl = selected?.type === "image" ? selected : null;
  const isTemplateBase = imageEl ? isTemplateBaseImage(imageEl.id) : false;
  const selectedTemplate = useDesignStore((s) => s.selectedTemplate);

  const resetTemplateBackground = () => {
    if (!imageEl || !isTemplateBase) return;
    const slug = selectedTemplate?.slug;
    const editorTpl = slug ? getEditorTemplate(slug) : null;
    if (!editorTpl) return;
    updateElement(imageEl.id, { src: getTemplatePreviewSrc(editorTpl) });
  };

  const setShape = (shape: "square" | "rounded" | "circle") => {
    if (!imageEl) return;
    const radius =
      shape === "circle"
        ? Math.min(imageEl.width, imageEl.height) / 2
        : shape === "rounded"
          ? 12
          : 0;
    updateElement(imageEl.id, { imageShape: shape, cornerRadius: radius });
  };

  return (
    <div className={cn("space-y-4", compact && "space-y-3")}>
      <MediaUploadDropzone
        context="resume"
        compact
        label="Upload image"
        cvId={cvId ?? undefined}
        onUploaded={(m) => {
          const url = m.optimizedUrl || m.secureUrl;
          if (imageEl) {
            updateElement(imageEl.id, { src: url });
          } else {
            addImageElement(url);
          }
        }}
      />

      {imageEl ? (
        <>
          <label className="block text-xs text-zinc-600">
            Zoom
            <input
              type="range"
              min={1}
              max={2}
              step={0.05}
              value={imageEl.imageScale ?? 1}
              onChange={(e) =>
                updateElement(imageEl.id, { imageScale: Number(e.target.value) })
              }
              className="mt-2 w-full accent-zinc-900"
            />
          </label>

          <div className="flex gap-2">
            {(["square", "rounded", "circle"] as const).map((shape) => (
              <button
                key={shape}
                type="button"
                onClick={() => setShape(shape)}
                className={cn(
                  "flex-1 rounded-lg border py-2 text-[10px] font-medium capitalize",
                  (imageEl.imageShape ?? "rounded") === shape
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 hover:bg-zinc-50"
                )}
              >
                {shape}
              </button>
            ))}
          </div>

          {isTemplateBase && (
            <button
              type="button"
              onClick={resetTemplateBackground}
              className="w-full rounded-xl border border-zinc-200 py-2 text-xs font-medium hover:bg-zinc-50"
            >
              Reset template background
            </button>
          )}

          {!isTemplateBase && (
            <button
              type="button"
              onClick={() => updateElement(imageEl.id, { src: "" })}
              className="w-full rounded-xl border border-zinc-200 py-2 text-xs font-medium hover:bg-zinc-50"
            >
              Remove image
            </button>
          )}

          {!isTemplateBase && (
            <button
              type="button"
              onClick={() => removeElement(imageEl.id)}
              className="w-full rounded-xl border border-red-100 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              Delete element
            </button>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center">
          <p className="text-sm font-medium text-zinc-600">Drop image here</p>
          <p className="mt-1 text-xs text-zinc-400">
            Upload a photo or add a Profile Photo block from Content.
          </p>
        </div>
      )}
    </div>
  );
}

export const StudioImageControls = memo(StudioImageControlsInner);
