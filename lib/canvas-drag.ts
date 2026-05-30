"use client";

import { useCallback, useLayoutEffect, useRef } from "react";
import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { EditorElement } from "@/types/cv-document";
import type { CanvasLayoutMode } from "@/lib/canvas-layout";
import { clampForLayoutMode } from "@/lib/canvas-layout";
import { useEditorStore } from "@/lib/editor-store";
import { computeAlignmentSnap } from "@/lib/layout-engine";

/** Keep dragged nodes inside the page while dragging (Konva dragBoundFunc). */
export function createCanvasDragBoundFunc(
  element: EditorElement,
  layoutMode: CanvasLayoutMode
) {
  return (pos: { x: number; y: number }) => {
    const clamped = clampForLayoutMode(
      { ...element, x: pos.x, y: pos.y },
      layoutMode
    );
    return { x: clamped.x, y: clamped.y };
  };
}

export function readDragPosition(node: { x: () => number; y: () => number }) {
  return {
    x: Math.round(node.x()),
    y: Math.round(node.y()),
  };
}

/** Konva drag wired to editor store — position is imperative to avoid React reset mid-drag. */
export function useCanvasElementDrag(
  element: EditorElement,
  onSelectOnDragStart?: (id: string) => void
) {
  const nodeRef = useRef<Konva.Group>(null);
  const isDraggingRef = useRef(false);

  const elements = useEditorStore((s) => s.elements);
  const layoutMode = useEditorStore((s) => s.layoutMode);
  const snapEnabled = useEditorStore((s) => s.snapEnabled);
  const setAlignmentGuides = useEditorStore((s) => s.setAlignmentGuides);
  const commitElementMove = useEditorStore((s) => s.commitElementMove);
  const clearAlignmentGuides = useEditorStore((s) => s.clearAlignmentGuides);

  useLayoutEffect(() => {
    const node = nodeRef.current;
    if (!node || isDraggingRef.current) return;
    node.position({ x: element.x, y: element.y });
  }, [element.id, element.x, element.y]);

  const handleDragStart = useCallback(() => {
    isDraggingRef.current = true;
    onSelectOnDragStart?.(element.id);
  }, [element.id, onSelectOnDragStart]);

  const handleDragMove = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      const node = e.target;
      let x = node.x();
      let y = node.y();

      if (snapEnabled) {
        const snapped = computeAlignmentSnap(elements, element.id, {
          x,
          y,
          width: element.width,
          height: element.height,
        });
        node.position({ x: snapped.x, y: snapped.y });
        setAlignmentGuides(snapped.guides);
      } else {
        const clamped = clampForLayoutMode({ ...element, x, y }, layoutMode);
        node.position({ x: clamped.x, y: clamped.y });
      }
    },
    [elements, element, snapEnabled, layoutMode, setAlignmentGuides]
  );

  const handleDragEnd = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      isDraggingRef.current = false;
      clearAlignmentGuides();
      const { x, y } = readDragPosition(e.target);
      commitElementMove(element.id, x, y);
    },
    [element.id, commitElementMove, clearAlignmentGuides]
  );

  const dragBoundFunc = useCallback(
    createCanvasDragBoundFunc(element, layoutMode),
    [element, layoutMode]
  );

  return {
    nodeRef,
    dragBoundFunc,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
}
