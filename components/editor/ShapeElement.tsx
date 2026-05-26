"use client";

import { memo, useCallback } from "react";
import { Group, Rect, Circle, Line } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { EditorElement } from "@/types/cv-document";
import { useEditorStore } from "@/lib/editor-store";
import { clampElement, computeAlignmentSnap } from "@/lib/layout-engine";

type Props = {
  element: EditorElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDoubleClick?: (id: string) => void;
};

function ShapeElementInner({ element, isSelected, onSelect, onDoubleClick }: Props) {
  const elements = useEditorStore((s) => s.elements);
  const snapEnabled = useEditorStore((s) => s.snapEnabled);
  const setAlignmentGuides = useEditorStore((s) => s.setAlignmentGuides);
  const commitElementMove = useEditorStore((s) => s.commitElementMove);
  const clearAlignmentGuides = useEditorStore((s) => s.clearAlignmentGuides);

  const dragHandlers = {
    onDragMove: useCallback(
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
    ),
    onDragEnd: useCallback(
      (e: KonvaEventObject<DragEvent>) => {
        clearAlignmentGuides();
        commitElementMove(element.id, e.target.x(), e.target.y());
      },
      [element.id, commitElementMove, clearAlignmentGuides]
    ),
  };

  const shapeType = element.shapeType ?? "rect";
  const fill = element.fill ?? "#6366f1";
  const opacity = element.opacity ?? 1;

  return (
    <Group
      id={element.id}
      name={element.id}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      draggable={!element.locked}
      opacity={opacity}
      onClick={() => onSelect(element.id)}
      onTap={() => onSelect(element.id)}
      onDblClick={() => onDoubleClick?.(element.id)}
      onDblTap={() => onDoubleClick?.(element.id)}
      {...dragHandlers}
    >
      {shapeType === "circle" ? (
        <Circle
          x={element.width / 2}
          y={element.height / 2}
          radius={Math.min(element.width, element.height) / 2}
          fill={fill}
          stroke={isSelected ? "#6366f1" : element.stroke}
          strokeWidth={isSelected ? 2 : element.strokeWidth ?? 0}
        />
      ) : shapeType === "line" ? (
        <Line
          points={[0, element.height / 2, element.width, element.height / 2]}
          stroke={fill}
          strokeWidth={element.strokeWidth ?? 3}
        />
      ) : (
        <Rect
          width={element.width}
          height={element.height}
          fill={fill}
          cornerRadius={element.cornerRadius ?? 8}
          stroke={isSelected ? "#6366f1" : element.stroke}
          strokeWidth={isSelected ? 2 : element.strokeWidth ?? 0}
        />
      )}
    </Group>
  );
}

export const ShapeElement = memo(ShapeElementInner);
