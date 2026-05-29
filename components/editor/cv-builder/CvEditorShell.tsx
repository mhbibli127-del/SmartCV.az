"use client";

import { memo, useEffect, useRef } from "react";
import {
  EditorCanvas,
  type EditorCanvasHandle,
} from "@/components/editor/cv-builder/EditorCanvas";
import { EditorToolbar } from "@/components/editor/cv-builder/EditorToolbar";
import { useCvEditorStore } from "@/store/cv-editor-store";

interface CvEditorShellProps {
  title: string;
  onTitleChange: (v: string) => void;
  onSave: () => void;
  onExport: () => void;
  saving: boolean;
  exporting: boolean;
  exportDisabled?: boolean;
  canvasRef?: React.Ref<EditorCanvasHandle>;
}

function CvEditorShellInner({
  title,
  onTitleChange,
  onSave,
  onExport,
  saving,
  exporting,
  exportDisabled,
  canvasRef,
}: CvEditorShellProps) {
  const internalRef = useRef<EditorCanvasHandle>(null);
  const ref = canvasRef ?? internalRef;
  const undo = useCvEditorStore((s) => s.undo);
  const redo = useCvEditorStore((s) => s.redo);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo]);

  return (
    <div className="-mx-6 flex h-[calc(100vh-32px)] flex-col md:-mx-8 md:h-screen">
      <EditorToolbar
        title={title}
        onTitleChange={onTitleChange}
        onSave={onSave}
        onExport={onExport}
        saving={saving}
        exporting={exporting}
        exportDisabled={exportDisabled}
      />
      <div className="min-h-0 flex-1">
        <EditorCanvas ref={ref} />
      </div>
    </div>
  );
}

export const CvEditorShell = memo(CvEditorShellInner);
