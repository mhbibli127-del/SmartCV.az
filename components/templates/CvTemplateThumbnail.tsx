"use client";

import { memo, useEffect, useState } from "react";
import Image from "next/image";
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
        <Image
          src={src}
          alt={`${template.name} preview`}
          fill
          unoptimized
          className="object-cover object-top"
          sizes="(max-width: 768px) 100vw, 25vw"
          priority={priority}
          onError={handleError}
        />
      )}
    </div>
  );
}

export const CvTemplateThumbnail = memo(CvTemplateThumbnailInner);
