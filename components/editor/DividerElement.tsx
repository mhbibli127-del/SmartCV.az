"use client";

import { memo, useCallback } from "react";
import { Group, Rect } from "react-konva";
import type { EditorElement } from "@/types/cv-document";
import { useCanvasElementDrag } from "@/lib/canvas-drag";

type Props = {
  element: EditorElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
  disableDrag?: boolean;
};

function DividerElementInner({ element, isSelected, onSelect, disableDrag }: Props) {
  const onSelectOnDragStart = useCallback((id: string) => onSelect(id), [onSelect]);
  const {
    nodeRef,
    dragBoundFunc,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  } = useCanvasElementDrag(element, onSelectOnDragStart);

  return (
    <Group
      ref={nodeRef}
      id={element.id}
      name={element.id}
      width={element.width}
      height={element.height}
      draggable={!element.locked && !disableDrag}
      dragBoundFunc={dragBoundFunc}
      onClick={() => onSelect(element.id)}
      onTap={() => onSelect(element.id)}
      onDragStart={handleDragStart}
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
