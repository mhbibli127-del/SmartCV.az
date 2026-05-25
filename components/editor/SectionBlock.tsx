"use client";

import { memo } from "react";
import { Group, Rect, Text } from "react-konva";
import type { EditorElement } from "@/types/cv-document";

type Props = {
  element: EditorElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onChange: (id: string, patch: Partial<EditorElement>) => void;
};

function SectionBlockInner({ element, isSelected, onSelect, onChange }: Props) {
  const label = (element.sectionType ?? "section").toUpperCase();

  return (
    <Group
      x={element.x}
      y={element.y}
      draggable
      onClick={() => onSelect(element.id)}
      onTap={() => onSelect(element.id)}
      onDragEnd={(e) => {
        onChange(element.id, { x: e.target.x(), y: e.target.y() });
      }}
    >
      <Rect
        width={element.width}
        height={element.height}
        fill="#fafafa"
        stroke={isSelected ? "#18181b" : "#e4e4e7"}
        strokeWidth={isSelected ? 1.5 : 1}
        cornerRadius={8}
      />
      <Text
        x={12}
        y={10}
        text={label}
        fontSize={9}
        fill="#71717a"
        letterSpacing={1}
      />
      <Text
        x={12}
        y={28}
        width={element.width - 24}
        height={element.height - 36}
        text={element.content ?? ""}
        fontSize={element.fontSize ?? 12}
        fill={element.fill ?? "#3f3f46"}
        wrap="word"
      />
    </Group>
  );
}

export const SectionBlock = memo(SectionBlockInner);
