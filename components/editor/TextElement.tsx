"use client";

import { memo, useCallback } from "react";
import { Text, Group, Rect } from "react-konva";
import type { EditorElement } from "@/types/cv-document";
import { useEditorStore } from "@/lib/editor-store";
import { useCanvasElementDrag } from "@/lib/canvas-drag";
import { isPlaceholderContent } from "@/lib/section-styles";
import { konvaFontStyle } from "@/lib/cv-text-style";

type Props = {
  element: EditorElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
  disableDrag?: boolean;
};

function TextElementInner({ element, isSelected, onSelect, disableDrag }: Props) {
  const layoutMode = useEditorStore((s) => s.layoutMode);
  const setEditingId = useEditorStore((s) => s.setEditingId);

  const onSelectOnDragStart = useCallback((id: string) => onSelect(id), [onSelect]);
  const {
    nodeRef,
    dragBoundFunc,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  } = useCanvasElementDrag(element, onSelectOnDragStart);

  const usePlaceholder =
    layoutMode === "flow" && isPlaceholderContent(element.text);
  const displayText = usePlaceholder ? "Click to edit" : (element.text ?? "");
  const textFill = usePlaceholder ? "#a1a1aa" : (element.fill ?? "#18181b");

  return (
    <Group
      ref={nodeRef}
      id={element.id}
      name={element.id}
      width={element.width}
      height={element.height}
      opacity={element.opacity ?? 1}
      draggable={!element.locked && !disableDrag}
      dragBoundFunc={dragBoundFunc}
      onClick={() => {
        onSelect(element.id);
        if (isSelected && !element.locked) setEditingId(element.id);
      }}
      onTap={() => {
        onSelect(element.id);
        if (isSelected && !element.locked) setEditingId(element.id);
      }}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDblClick={() => setEditingId(element.id)}
      onDblTap={() => setEditingId(element.id)}
    >
      <Rect width={element.width} height={element.height} fill="transparent" />
      {isSelected && !element.locked && (
        <Rect
          width={element.width}
          height={element.height}
          stroke="#6366f1"
          strokeWidth={1}
          listening={false}
        />
      )}
      <Text
        width={element.width}
        height={element.height}
        text={displayText}
        fontSize={element.fontSize ?? 13}
        fontFamily={element.fontFamily ?? "Inter, sans-serif"}
        fill={textFill}
        fontStyle={usePlaceholder ? "italic" : konvaFontStyle(element)}
        align={element.textAlign ?? "left"}
        verticalAlign="top"
        lineHeight={element.lineHeight}
        letterSpacing={element.letterSpacing}
        wrap="word"
        listening={false}
        perfectDrawEnabled
      />
    </Group>
  );
}

export const TextElement = memo(TextElementInner);
