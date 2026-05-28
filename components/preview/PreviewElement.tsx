"use client";

import { memo } from "react";
import type { CvEditorElement } from "@/types/cv-editor";

interface PreviewElementProps {
  element: CvEditorElement;
}

function PreviewElementInner({ element }: PreviewElementProps) {
  const style = element.style;

  const boxStyle: React.CSSProperties = {
    position: "absolute",
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    zIndex: element.zIndex,
    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
    pointerEvents: "none",
  };

  if (element.type === "image") {
    return (
      <div style={boxStyle}>
        {element.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={element.src}
            alt=""
            className="h-full w-full object-cover"
            style={{ borderRadius: style.borderRadius }}
            draggable={false}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-xs text-white/80"
            style={{
              background: style.background ?? "#71717a",
              borderRadius: style.borderRadius,
              opacity: style.opacity ?? 1,
            }}
          >
            Photo
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        ...boxStyle,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        fontStyle: style.fontStyle,
        textDecoration: style.textDecoration,
        textAlign: style.textAlign,
        color: style.color,
        background: style.background,
        borderRadius: style.borderRadius,
        opacity: style.opacity ?? 1,
        fontFamily: style.fontFamily,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing,
        padding: style.padding,
        border: style.border,
        boxShadow: style.boxShadow,
        textShadow: style.textShadow,
        whiteSpace: "pre-wrap",
        overflow: "hidden",
      }}
    >
      {element.content}
    </div>
  );
}

export const PreviewElement = memo(PreviewElementInner);
