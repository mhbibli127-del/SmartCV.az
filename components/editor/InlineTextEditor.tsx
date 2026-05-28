"use client";

import { memo, useEffect, useRef } from "react";
import type Konva from "konva";
import { useEditorStore } from "@/lib/editor-store";

type Props = {
  stageRef: React.RefObject<Konva.Stage | null>;
};

function InlineTextEditorInner({ stageRef }: Props) {
  const editingId = useEditorStore((s) => s.editingId);
  const elements = useEditorStore((s) => s.elements);
  const updateElement = useEditorStore((s) => s.updateElement);
  const setEditingId = useEditorStore((s) => s.setEditingId);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initialValueRef = useRef("");

  const element = elements.find((e) => e.id === editingId);

  useEffect(() => {
    if (!editingId) {
      initialValueRef.current = "";
      return;
    }
    const el = elements.find((e) => e.id === editingId);
    if (!el) return;
    initialValueRef.current =
      el.type === "section" ? el.content ?? "" : el.text ?? "";
  }, [editingId, elements]);

  useEffect(() => {
    if (!editingId) {
      initialValueRef.current = "";
      return;
    }
    const el = elements.find((e) => e.id === editingId);
    if (!el) return;
    initialValueRef.current =
      el.type === "section" ? el.content ?? "" : el.text ?? "";
  }, [editingId, elements]);

  useEffect(() => {
    if (!editingId || !textareaRef.current) return;
    textareaRef.current.focus();
    const len = textareaRef.current.value.length;
    textareaRef.current.setSelectionRange(len, len);
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [editingId, element?.text, element?.content]);

  if (!element || !stageRef.current) return null;
  if (element.type !== "text" && element.type !== "section") return null;

  const stage = stageRef.current;
  const container = stage.container().getBoundingClientRect();
  const node = stage.findOne(`#${element.id}`);
  if (!node) return null;

  const abs = node.getAbsolutePosition();
  const scaleX = container.width / stage.width();
  const scaleY = container.height / stage.height();
  const value = element.type === "section" ? element.content ?? "" : element.text ?? "";

  const commit = () => {
    const text = textareaRef.current?.value ?? value;
    if (element.type === "section") {
      updateElement(element.id, { content: text });
    } else {
      updateElement(element.id, { text });
    }
    initialValueRef.current = "";
    setEditingId(null);
  };

  const cancel = () => {
    if (element.type === "section") {
      updateElement(element.id, { content: initialValueRef.current }, false);
    } else {
      updateElement(element.id, { text: initialValueRef.current }, false);
    }
    initialValueRef.current = "";
    setEditingId(null);
  };

  return (
    <textarea
      ref={textareaRef}
      defaultValue={value}
      onInput={(e) => {
        const target = e.currentTarget;
        target.style.height = "auto";
        target.style.height = `${target.scrollHeight}px`;
        if (element.type === "section") {
          updateElement(element.id, { content: target.value }, false);
        } else {
          updateElement(element.id, { text: target.value }, false);
        }
      }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          cancel();
          return;
        }
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          commit();
          return;
        }
        e.stopPropagation();
      }}
      className="fixed z-50 resize-none overflow-hidden rounded border-2 border-zinc-900 bg-white px-2 py-1 text-zinc-900 shadow-lg focus:outline-none"
      style={{
        left: container.left + abs.x * scaleX,
        top: container.top + abs.y * scaleY,
        width: Math.max(element.width * scaleX, 80),
        minHeight: Math.max(element.height * scaleY, 24),
        fontSize: (element.fontSize ?? 13) * scaleY,
        fontFamily: element.fontFamily ?? "Inter, sans-serif",
        lineHeight: 1.35,
      }}
    />
  );
}

export const InlineTextEditor = memo(InlineTextEditorInner);
