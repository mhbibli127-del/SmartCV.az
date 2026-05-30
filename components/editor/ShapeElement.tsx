"use client";

import { memo, useCallback } from "react";
import { Group, Rect, Circle, Line } from "react-konva";
import type { EditorElement } from "@/types/cv-document";
import { useCanvasElementDrag } from "@/lib/canvas-drag";

type Props = {
  element: EditorElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDoubleClick?: (id: string) => void;
  disableDrag?: boolean;
};

function ShapeElementInner({ element, isSelected, onSelect, onDoubleClick, disableDrag }: Props) {
  const onSelectOnDragStart = useCallback((id: string) => onSelect(id), [onSelect]);
  const {
    nodeRef,
    dragBoundFunc,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  } = useCanvasElementDrag(element, onSelectOnDragStart);

  const shapeType = element.shapeType ?? "rect";
  const fill = element.fill ?? "#6366f1";
  const opacity = element.opacity ?? 1;
  const stroke = isSelected ? "#6366f1" : element.stroke;
  const strokeWidth = isSelected ? 2 : element.strokeWidth ?? 0;

  return (
    <Group
      ref={nodeRef}
      id={element.id}
      name={element.id}
      width={element.width}
      height={element.height}
      draggable={!element.locked && !disableDrag}
      dragBoundFunc={dragBoundFunc}
      opacity={opacity}
      onClick={() => onSelect(element.id)}
      onTap={() => onSelect(element.id)}
      onDblClick={() => onDoubleClick?.(element.id)}
      onDblTap={() => onDoubleClick?.(element.id)}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      {shapeType === "circle" ? (
        <Circle
          x={element.width / 2}
          y={element.height / 2}
          radius={Math.min(element.width, element.height) / 2}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
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
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      )}
    </Group>
  );
}

export const ShapeElement = memo(ShapeElementInner);
