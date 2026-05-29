"use client";

import { memo } from "react";
import Image from "next/image";
import type { CvEditorTemplate } from "@/types/cv-editor";
import { cn } from "@/lib/utils";

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
  const src = template.previewImage || `/templates/${template.slug}.svg`;

  return (
    <div
      className={cn(
        "relative aspect-[210/297] w-full overflow-hidden rounded-xl bg-zinc-100",
        className
      )}
    >
      <Image
        src={src}
        alt={`${template.name} preview`}
        fill
        unoptimized
        className="object-cover object-top"
        sizes="(max-width: 768px) 100vw, 25vw"
        priority={priority}
      />
    </div>
  );
}

export const CvTemplateThumbnail = memo(CvTemplateThumbnailInner);
