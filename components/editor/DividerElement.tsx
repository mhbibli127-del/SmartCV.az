"use client";

import { memo, useCallback } from "react";
import { Group, Rect } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { EditorElement } from "@/types/cv-document";
import { useEditorStore } from "@/lib/editor-store";
import { clampElement, computeAlignmentSnap } from "@/lib/layout-engine";

type Props = {
  element: EditorElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
};

function DividerElementInner({ element, isSelected, onSelect }: Props) {
  const elements = useEditorStore((s) => s.elements);
  const snapEnabled = useEditorStore((s) => s.snapEnabled);
  const setAlignmentGuides = useEditorStore((s) => s.setAlignmentGuides);
  const commitElementMove = useEditorStore((s) => s.commitElementMove);
  const clearAlignmentGuides = useEditorStore((s) => s.clearAlignmentGuides);

  const handleDragMove = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      const node = e.target;
      if (snapEnabled) {
        const snapped = computeAlignmentSnap(elements, element.id, {
          x: node.x(),
          y: node.y(),
          width: element.width,
          height: element.height,
        });
        node.position({ x: snapped.x, y: snapped.y });
        setAlignmentGuides(snapped.guides);
      } else {
        const clamped = clampElement({ ...element, x: node.x(), y: node.y() });
        node.position({ x: clamped.x, y: clamped.y });
      }
    },
    [elements, element, snapEnabled, setAlignmentGuides]
  );

  const handleDragEnd = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      clearAlignmentGuides();
      commitElementMove(element.id, e.target.x(), e.target.y());
    },
    [element.id, commitElementMove, clearAlignmentGuides]
  );

  return (
    <Group
      id={element.id}
      name={element.id}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      draggable={!element.locked}
      onClick={() => onSelect(element.id)}
      onTap={() => onSelect(element.id)}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <Rect
        width={element.width}
        height={Math.max(2, element.height)}
        fill={element.fill ?? "#d4d4d8"}
        stroke={isSelected ? "#6366f1" : undefined}
        strokeWidth={isSelected ? 1 : 0}
      />
    </Group>
  );
}

export const DividerElement = memo(DividerElementInner);
