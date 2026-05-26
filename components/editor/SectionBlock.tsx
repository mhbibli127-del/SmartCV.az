"use client";

import { memo, useCallback } from "react";
import { Group, Rect, Text } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { EditorElement } from "@/types/cv-document";
import { useEditorStore } from "@/lib/editor-store";
import { clampElement, computeAlignmentSnap } from "@/lib/layout-engine";

type Props = {
  element: EditorElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
};

function SectionBlockInner({ element, isSelected, onSelect }: Props) {
  const label = (element.sectionType ?? "section").toUpperCase();
  const elements = useEditorStore((s) => s.elements);
  const snapEnabled = useEditorStore((s) => s.snapEnabled);
  const setAlignmentGuides = useEditorStore((s) => s.setAlignmentGuides);
  const commitElementMove = useEditorStore((s) => s.commitElementMove);
  const clearAlignmentGuides = useEditorStore((s) => s.clearAlignmentGuides);
  const setEditingId = useEditorStore((s) => s.setEditingId);

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
      draggable={!element.locked}
      onClick={() => onSelect(element.id)}
      onTap={() => onSelect(element.id)}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragStart={() => onSelect(element.id)}
      onDblClick={() => setEditingId(element.id)}
      onDblTap={() => setEditingId(element.id)}
    >
      <Rect
        width={element.width}
        height={element.height}
        fill="#fafafa"
        stroke={isSelected ? "#6366f1" : "#e4e4e7"}
        strokeWidth={isSelected ? 1.5 : 1}
        cornerRadius={8}
      />
      {element.locked && (
        <Rect
          width={element.width}
          height={element.height}
          fill="rgba(0,0,0,0.04)"
          cornerRadius={8}
          listening={false}
        />
      )}
      <Text
        x={12}
        y={10}
        text={label}
        fontSize={9}
        fill="#71717a"
        letterSpacing={1}
        listening={false}
      />
      <Text
        x={12}
        y={28}
        width={element.width - 24}
        height={element.height - 36}
        text={element.content ?? ""}
        fontSize={element.fontSize ?? 12}
        fontFamily={element.fontFamily ?? "Inter"}
        fill={element.fill ?? "#3f3f46"}
        wrap="word"
        listening={false}
      />
    </Group>
  );
}

export const SectionBlock = memo(SectionBlockInner);
