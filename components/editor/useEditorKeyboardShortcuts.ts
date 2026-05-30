"use client";

import { useEffect } from "react";
import { useEditorStore } from "@/lib/editor-store";

export function useEditorKeyboardShortcuts() {
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const removeElement = useEditorStore((s) => s.removeElement);
  const selectedId = useEditorStore((s) => s.selectedId);
  const selectElement = useEditorStore((s) => s.selectElement);
  const updateElement = useEditorStore((s) => s.updateElement);
  const bringForward = useEditorStore((s) => s.bringForward);
  const sendBackward = useEditorStore((s) => s.sendBackward);
  const toggleSnap = useEditorStore((s) => s.toggleSnap);
  const copyElement = useEditorStore((s) => s.copyElement);
  const pasteElement = useEditorStore((s) => s.pasteElement);
  const duplicateElement = useEditorStore((s) => s.duplicateElement);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if ((mod && e.key === "z" && e.shiftKey) || (mod && e.key === "y")) {
        e.preventDefault();
        redo();
        return;
      }
      if (mod && e.key === "c" && selectedId) {
        e.preventDefault();
        copyElement(selectedId);
        return;
      }
      if (mod && e.key === "v") {
        e.preventDefault();
        pasteElement();
        return;
      }
      if (mod && e.key === "d" && selectedId) {
        e.preventDefault();
        duplicateElement(selectedId);
        return;
      }
      if (e.key === "Escape") {
        selectElement(null);
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        removeElement(selectedId);
        return;
      }
      if (e.key === "]" && selectedId) {
        e.preventDefault();
        bringForward(selectedId);
        return;
      }
      if (e.key === "[" && selectedId) {
        e.preventDefault();
        sendBackward(selectedId);
        return;
      }
      if (e.key === "g" && mod) {
        e.preventDefault();
        toggleSnap();
        return;
      }

      if (!selectedId) return;
      const step = e.shiftKey ? 8 : 1;
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const el = useEditorStore.getState().elements.find((x) => x.id === selectedId);
        if (el) updateElement(selectedId, { y: el.y - step });
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const el = useEditorStore.getState().elements.find((x) => x.id === selectedId);
        if (el) updateElement(selectedId, { y: el.y + step });
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        const el = useEditorStore.getState().elements.find((x) => x.id === selectedId);
        if (el) updateElement(selectedId, { x: el.x - step });
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        const el = useEditorStore.getState().elements.find((x) => x.id === selectedId);
        if (el) updateElement(selectedId, { x: el.x + step });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    undo,
    redo,
    removeElement,
    selectedId,
    selectElement,
    updateElement,
    bringForward,
    sendBackward,
    toggleSnap,
    copyElement,
    pasteElement,
    duplicateElement,
  ]);
}
