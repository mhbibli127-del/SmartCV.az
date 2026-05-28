"use client";

import { memo, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CvEditorTemplate } from "@/types/cv-editor";
import {
  A4_HEIGHT,
  A4_WIDTH,
  buildElementsFromTemplate,
  canvasBackground,
} from "@/lib/cv-editor/template-catalog";
import { PreviewElement } from "@/components/preview/PreviewElement";
import { cn } from "@/lib/utils";

interface TemplateCanvasPreviewProps {
  template: CvEditorTemplate;
  className?: string;
  /** Fixed scale override. When omitted, preview auto-fits container width. */
  scale?: number;
  showShadow?: boolean;
}

function TemplateCanvasPreviewInner({
  template,
  className,
  scale: scaleOverride,
  showShadow = true,
}: TemplateCanvasPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(0.28);

  const elements = useMemo(() => buildElementsFromTemplate(template), [template]);
  const background = useMemo(() => canvasBackground(template), [template]);
  const scale = scaleOverride ?? fitScale;

  useLayoutEffect(() => {
    if (scaleOverride !== undefined || !containerRef.current) return;

    const node = containerRef.current;
    const update = () => {
      const width = node.clientWidth;
      if (width > 0) setFitScale(width / A4_WIDTH);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [scaleOverride, template.id]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden bg-zinc-100",
        className
      )}
      style={{ aspectRatio: `${A4_WIDTH} / ${A4_HEIGHT}` }}
    >
      <div
        className={cn("absolute left-0 top-0 origin-top-left", showShadow && "shadow-lg")}
        style={{
          width: A4_WIDTH,
          height: A4_HEIGHT,
          transform: `scale(${scale})`,
          background,
        }}
      >
        <div className="relative h-full w-full">
          {elements
            .slice()
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((element) => (
              <PreviewElement key={element.id} element={element} />
            ))}
        </div>
      </div>
    </div>
  );
}

export const TemplateCanvasPreview = memo(TemplateCanvasPreviewInner);
