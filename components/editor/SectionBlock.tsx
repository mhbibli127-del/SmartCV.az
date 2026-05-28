"use client";

import { memo, useCallback } from "react";
import { Group, Text } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { EditorElement } from "@/types/cv-document";
import { useEditorStore } from "@/lib/editor-store";
import { clampElement, computeAlignmentSnap } from "@/lib/layout-engine";
import { isPlaceholderContent } from "@/lib/section-styles";
import { SectionBlockChrome, sectionContentLayout } from "@/components/editor/SectionBlockChrome";

type Props = {
  element: EditorElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
  disableDrag?: boolean;
};

function SectionBlockInner({ element, isSelected, onSelect, disableDrag }: Props) {
  const label = (element.sectionType ?? "section").toUpperCase();
  const elements = useEditorStore((s) => s.elements);
  const snapEnabled = useEditorStore((s) => s.snapEnabled);
  const setAlignmentGuides = useEditorStore((s) => s.setAlignmentGuides);
  const commitElementMove = useEditorStore((s) => s.commitElementMove);
  const clearAlignmentGuides = useEditorStore((s) => s.clearAlignmentGuides);
  const setEditingId = useEditorStore((s) => s.setEditingId);

  const layout = sectionContentLayout(element, element.width, element.height);
  const displayContent = isPlaceholderContent(element.content)
    ? "Click to edit"
    : (element.content ?? "");

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
        const clamped = clampElement({ ...element, x, y });
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
      draggable={!element.locked && !disableDrag}
      onClick={() => {
        onSelect(element.id);
        if (isSelected && !element.locked) setEditingId(element.id);
      }}
      onTap={() => {
        onSelect(element.id);
        if (isSelected && !element.locked) setEditingId(element.id);
      }}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragStart={() => onSelect(element.id)}
      onDblClick={() => setEditingId(element.id)}
      onDblTap={() => setEditingId(element.id)}
    >
      <SectionBlockChrome
        element={element}
        isSelected={isSelected}
        width={element.width}
        height={element.height}
      />
      <Text
        x={layout.labelX}
        y={layout.labelY}
        text={label}
        fontSize={layout.labelSize}
        fill={isPlaceholderContent(element.content) ? "#a1a1aa" : "#71717a"}
        letterSpacing={1}
        listening={false}
      />
      <Text
        x={layout.contentX}
        y={layout.contentY}
        width={layout.contentW}
        height={layout.contentH}
        text={displayContent}
        fontSize={layout.fontSize}
        fontFamily={element.fontFamily ?? "Inter"}
        fill={isPlaceholderContent(element.content) ? "#a1a1aa" : (element.fill ?? "#3f3f46")}
        fontStyle={isPlaceholderContent(element.content) ? "italic" : "normal"}
        lineHeight={element.lineHeight}
        letterSpacing={element.letterSpacing}
        wrap="word"
        listening={false}
      />
    </Group>
  );
}

export const SectionBlock = memo(SectionBlockInner);
