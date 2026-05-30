"use client";

import { memo, useEffect, useState } from "react";
import type { CvEditorTemplate } from "@/types/cv-editor";
import { cn } from "@/lib/utils";

const FALLBACK_PREVIEW = "/templates/minimal-corporate.svg";

interface CvTemplateThumbnailProps {
  template: CvEditorTemplate;
  className?: string;
  priority?: boolean;
}

function CvTemplateThumbnailInner({
  template,
  className = "",
  priority = false,
}: CvTemplateThumbnailProps) {
  const primarySrc =
    template.previewImage || `/templates/${template.slug}.svg`;
  const [src, setSrc] = useState(primarySrc);
  const [showTextFallback, setShowTextFallback] = useState(false);

  useEffect(() => {
    setSrc(primarySrc);
    setShowTextFallback(false);
  }, [primarySrc]);

  const handleError = () => {
    if (showTextFallback) return;
    if (src !== FALLBACK_PREVIEW) {
      setSrc(FALLBACK_PREVIEW);
      return;
    }
    setShowTextFallback(true);
  };

  return (
    <div
      className={cn(
        "relative aspect-[210/297] w-full overflow-hidden rounded-xl bg-zinc-100",
        className
      )}
    >
      {showTextFallback ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
          <span className="text-xs font-medium text-zinc-600">{template.name}</span>
          <span className="text-[10px] text-zinc-400">{template.category}</span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- matches studio SVG base layer
        <img
          src={src}
          alt={`${template.name} preview`}
          className="absolute inset-0 h-full w-full object-cover object-top"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          onError={handleError}
        />
      )}
    </div>
  );
}

export const CvTemplateThumbnail = memo(CvTemplateThumbnailInner);
