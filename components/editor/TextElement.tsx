"use client";

import { memo, useCallback } from "react";
import { Text, Group, Rect } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { EditorElement } from "@/types/cv-document";
import { useEditorStore } from "@/lib/editor-store";
import { clampElement, computeAlignmentSnap } from "@/lib/layout-engine";
import { isPlaceholderContent } from "@/lib/section-styles";

type Props = {
  element: EditorElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
  disableDrag?: boolean;
};

function TextElementInner({ element, isSelected, onSelect, disableDrag }: Props) {
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
      {element.locked && (
        <Rect
          width={element.width}
          height={element.height}
          fill="rgba(0,0,0,0.03)"
          listening={false}
        />
      )}
      <Text
        width={element.width}
        height={element.height}
        text={
          isPlaceholderContent(element.text) ? "Click to edit" : (element.text ?? "")
        }
        fontSize={element.fontSize ?? 13}
        fontFamily={element.fontFamily ?? "Inter"}
        fill={
          isPlaceholderContent(element.text)
            ? "#a1a1aa"
            : (element.fill ?? "#18181b")
        }
        fontStyle={
          isPlaceholderContent(element.text)
            ? "italic"
            : element.fontWeight === "bold"
              ? "bold"
              : "normal"
        }
        lineHeight={element.lineHeight}
        letterSpacing={element.letterSpacing}
        wrap="word"
        listening={false}
      />
    </Group>
  );
}

export const TextElement = memo(TextElementInner);
