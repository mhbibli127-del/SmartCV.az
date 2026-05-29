"use client";

import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { useCvEditorStore, A4_WIDTH, A4_HEIGHT } from "@/store/cv-editor-store";
import { DocumentElement } from "@/components/editor/cv-builder/DocumentElement";
import { cn } from "@/lib/utils";

export interface EditorCanvasHandle {
  getPaperElement: () => HTMLElement | null;
  isReady: () => boolean;
}

interface EditorCanvasProps {
  className?: string;
  onReady?: () => void;
}

function EditorCanvasInner(
  { className, onReady }: EditorCanvasProps,
  ref: React.Ref<EditorCanvasHandle>
) {
  const paperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const elements = useCvEditorStore((s) => s.elements);
  const background = useCvEditorStore((s) => s.background);
  const zoom = useCvEditorStore((s) => s.zoom);
  const selectElement = useCvEditorStore((s) => s.selectElement);

  useImperativeHandle(ref, () => ({
    getPaperElement: () => paperRef.current,
    isReady: () =>
      Boolean(
        paperRef.current &&
          paperRef.current.offsetWidth > 0 &&
          paperRef.current.offsetHeight > 0
      ),
  }));

  useEffect(() => {
    if (!onReady) return;

    let cancelled = false;
    let frame = 0;

    const notifyWhenReady = () => {
      if (cancelled) return;
      const paper = paperRef.current;
      if (paper && paper.offsetWidth > 0 && paper.offsetHeight > 0) {
        onReady();
        return;
      }
      frame = requestAnimationFrame(notifyWhenReady);
    };

    frame = requestAnimationFrame(notifyWhenReady);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [onReady, elements.length]);

  const handleBackgroundClick = useCallback(() => {
    selectElement(null);
  }, [selectElement]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex flex-1 items-start justify-center overflow-auto bg-[#e8e8ea] py-10",
        className
      )}
    >
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "top center",
        }}
      >
        <div
          ref={paperRef}
          id="cv-editor-paper"
          data-export-canvas
          onClick={handleBackgroundClick}
          className="relative bg-white"
          style={{
            width: A4_WIDTH,
            height: A4_HEIGHT,
            background,
            boxShadow:
              "0 1px 2px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.12), 0 24px 48px rgba(0,0,0,0.08)",
          }}
        >
          {elements
            .slice()
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((el) => (
              <DocumentElement key={el.id} element={el} />
            ))}
        </div>
      </div>
    </div>
  );
}

export const EditorCanvas = memo(forwardRef(EditorCanvasInner));
