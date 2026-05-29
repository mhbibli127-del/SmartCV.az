"use client";

import { memo, useEffect, useState } from "react";
import { resolveImageSrc } from "@/lib/cv-editor/template-images";
import { DEFAULT_PORTRAIT_SRC } from "@/templates/shared";
import { needsCrossOrigin } from "@/lib/wait-for-images";
import { cn } from "@/lib/utils";

interface CvExportImageProps {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  placeholderLabel?: string;
  placeholderClassName?: string;
}

/** Plain <img> for canvas/html2canvas export — not next/image. */
function CvExportImageInner({
  src,
  alt = "",
  className,
  style,
  placeholderLabel = "Photo",
  placeholderClassName,
}: CvExportImageProps) {
  const initialSrc = resolveImageSrc(src);
  const [currentSrc, setCurrentSrc] = useState(initialSrc);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrentSrc(resolveImageSrc(src));
    setLoaded(false);
    setFailed(false);
  }, [src]);

  const handleError = () => {
    if (currentSrc !== DEFAULT_PORTRAIT_SRC) {
      setCurrentSrc(DEFAULT_PORTRAIT_SRC);
      setLoaded(false);
      setFailed(false);
      return;
    }
    setFailed(true);
    setLoaded(true);
  };

  if (failed) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-zinc-300 text-xs text-zinc-600",
          placeholderClassName
        )}
        style={style}
      >
        {placeholderLabel}
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden" style={style}>
      {!loaded && (
        <div
          className={cn(
            "absolute inset-0 animate-pulse bg-zinc-200",
            placeholderClassName
          )}
          aria-hidden
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={currentSrc}
        alt={alt}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-200",
          loaded ? "opacity-100" : "opacity-0",
          className
        )}
        crossOrigin={needsCrossOrigin(currentSrc) ? "anonymous" : undefined}
        loading="eager"
        decoding="sync"
        draggable={false}
        onLoad={() => setLoaded(true)}
        onError={handleError}
      />
    </div>
  );
}

export const CvExportImage = memo(CvExportImageInner);
