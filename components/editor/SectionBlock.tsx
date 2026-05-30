"use client";

import { memo, useCallback } from "react";
import { Group, Text } from "react-konva";
import type { EditorElement } from "@/types/cv-document";
import { useEditorStore } from "@/lib/editor-store";
import { useCanvasElementDrag } from "@/lib/canvas-drag";
import { isPlaceholderContent } from "@/lib/section-styles";
import { konvaFontStyle } from "@/lib/cv-text-style";
import { SectionBlockChrome, sectionContentLayout } from "@/components/editor/SectionBlockChrome";

type Props = {
  element: EditorElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
  disableDrag?: boolean;
};

function SectionBlockInner({ element, isSelected, onSelect, disableDrag }: Props) {
  const label = (element.sectionType ?? "section").toUpperCase();
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

  const layout = sectionContentLayout(element, element.width, element.height);
  const usePlaceholder =
    layoutMode === "flow" && isPlaceholderContent(element.content);
  const displayContent = usePlaceholder ? "Click to edit" : (element.content ?? "");
  const isLayoutShell =
    layoutMode === "absolute" && !element.content?.trim() && Boolean(element.fill);

  return (
    <Group
      ref={nodeRef}
      id={element.id}
      name={element.id}
      width={element.width}
      height={element.height}
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
      {!isLayoutShell && (
        <SectionBlockChrome
          element={element}
          isSelected={isSelected}
          width={element.width}
          height={element.height}
        />
      )}
      {!isLayoutShell && (
        <Text
          x={layout.labelX}
          y={layout.labelY}
          text={label}
          fontSize={layout.labelSize}
          fill={usePlaceholder ? "#a1a1aa" : "#71717a"}
          letterSpacing={1}
          listening={false}
        />
      )}
      <Text
        x={isLayoutShell ? 0 : layout.contentX}
        y={isLayoutShell ? 0 : layout.contentY}
        width={isLayoutShell ? element.width : layout.contentW}
        height={isLayoutShell ? element.height : layout.contentH}
        text={displayContent}
        fontSize={layout.fontSize}
        fontFamily={element.fontFamily ?? "Inter, sans-serif"}
        fill={usePlaceholder ? "#a1a1aa" : (element.fill ?? "#3f3f46")}
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

export const SectionBlock = memo(SectionBlockInner);
