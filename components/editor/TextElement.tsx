"use client";

import { memo } from "react";
import { Text, Group, Rect } from "react-konva";
import type { EditorElement } from "@/types/cv-document";

type Props = {
  element: EditorElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onChange: (id: string, patch: Partial<EditorElement>) => void;
};

function TextElementInner({ element, isSelected, onSelect, onChange }: Props) {
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
      {isSelected && (
        <Rect
          x={-4}
          y={-4}
          width={element.width + 8}
          height={element.height + 8}
          stroke="#18181b"
          strokeWidth={1}
          dash={[4, 4]}
          listening={false}
        />
      )}
      <Text
        width={element.width}
        height={element.height}
        text={element.text ?? ""}
        fontSize={element.fontSize ?? 13}
        fill={element.fill ?? "#18181b"}
        fontStyle={element.fontWeight === "bold" ? "bold" : "normal"}
        wrap="word"
      />
    </Group>
  );
}

export const TextElement = memo(TextElementInner);
