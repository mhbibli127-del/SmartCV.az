"use client";

import { memo, useEffect, useRef } from "react";
import type Konva from "konva";
import { useEditorStore } from "@/lib/editor-store";

type Props = {
  stageRef: React.RefObject<Konva.Stage | null>;
  scale?: number;
};

function InlineTextEditorInner({ stageRef, scale = 1 }: Props) {
  const editingId = useEditorStore((s) => s.editingId);
  const elements = useEditorStore((s) => s.elements);
  const updateElement = useEditorStore((s) => s.updateElement);
  const setEditingId = useEditorStore((s) => s.setEditingId);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const element = elements.find((e) => e.id === editingId);

  useEffect(() => {
    if (editingId && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [editingId]);

  if (!element || !stageRef.current) return null;
  if (element.type !== "text" && element.type !== "section") return null;

  const stage = stageRef.current;
  const container = stage.container().getBoundingClientRect();
  const node = stage.findOne(`#${element.id}`);
  if (!node) return null;

  const abs = node.getAbsolutePosition();
  const value = element.type === "section" ? element.content ?? "" : element.text ?? "";

  const commit = () => {
    const text = textareaRef.current?.value ?? value;
    if (element.type === "section") {
      updateElement(element.id, { content: text });
    } else {
      updateElement(element.id, { text });
    }
    setEditingId(null);
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        if (element.type === "section") {
          updateElement(element.id, { content: e.target.value }, false);
        } else {
          updateElement(element.id, { text: e.target.value }, false);
        }
      }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Escape") setEditingId(null);
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) commit();
        e.stopPropagation();
      }}
      className="fixed z-50 resize-none overflow-hidden rounded border-2 border-violet-500 bg-white px-2 py-1 text-zinc-900 shadow-lg focus:outline-none"
      style={{
        left: container.left + abs.x * scale,
        top: container.top + abs.y * scale,
        width: element.width * scale,
        minHeight: element.height * scale,
        fontSize: (element.fontSize ?? 13) * scale,
        fontFamily: element.fontFamily ?? "Inter, sans-serif",
        lineHeight: 1.35,
      }}
    />
  );
}

export const InlineTextEditor = memo(InlineTextEditorInner);
