"use client";

import { memo, useCallback, useRef, useEffect } from "react";
import type { CvEditorElement } from "@/types/cv-editor";
import { useCvEditorStore } from "@/store/cv-editor-store";
import { cn } from "@/lib/utils";

interface DocumentElementProps {
  element: CvEditorElement;
}

function DocumentElementInner({ element }: DocumentElementProps) {
  const editingId = useCvEditorStore((s) => s.editingId);
  const setEditingId = useCvEditorStore((s) => s.setEditingId);
  const updateElement = useCvEditorStore((s) => s.updateElement);
  const editRef = useRef<HTMLDivElement>(null);
  const isEditing = editingId === element.id;
  const style = element.style;

  useEffect(() => {
    if (!editRef.current || isEditing) return;
    if (editRef.current.innerText !== element.content) {
      editRef.current.innerText = element.content;
    }
  }, [element.content, isEditing]);

  const finishEdit = useCallback(() => {
    if (editRef.current) {
      updateElement(element.id, { content: editRef.current.innerText });
    }
    setEditingId(null);
  }, [element.id, setEditingId, updateElement]);

  const boxStyle: React.CSSProperties = {
    position: "absolute",
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    zIndex: element.zIndex,
    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
  };

  const textStyle: React.CSSProperties = {
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
    lineHeight: style.lineHeight ?? 1.45,
    letterSpacing: style.letterSpacing,
    padding: style.padding,
    border: style.border,
    boxShadow: style.boxShadow,
    textShadow: style.textShadow,
    whiteSpace: "pre-wrap",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
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
    <div style={boxStyle}>
      <div
        ref={editRef}
        contentEditable={!element.locked}
        suppressContentEditableWarning
        onFocus={() => setEditingId(element.id)}
        onBlur={finishEdit}
        className={cn(
          "h-full w-full overflow-hidden outline-none",
          isEditing && "ring-1 ring-blue-400/80 rounded-sm"
        )}
        style={textStyle}
      />
    </div>
  );
}

export const DocumentElement = memo(DocumentElementInner);
