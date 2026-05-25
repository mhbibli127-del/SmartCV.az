"use client";

import { memo } from "react";
import {
  Type,
  LayoutTemplate,
  Undo2,
  Redo2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Grid3X3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/lib/editor-store";

type Props = {
  onSave: () => void;
  onExport: () => void;
  saving?: boolean;
  onAiRewrite?: () => void;
  aiLoading?: boolean;
};

function ToolbarInner({ onSave, onExport, saving, onAiRewrite, aiLoading }: Props) {
  const addTextElement = useEditorStore((s) => s.addTextElement);
  const addSectionBlock = useEditorStore((s) => s.addSectionBlock);
  const selectedId = useEditorStore((s) => s.selectedId);
  const removeElement = useEditorStore((s) => s.removeElement);
  const bringForward = useEditorStore((s) => s.bringForward);
  const sendBackward = useEditorStore((s) => s.sendBackward);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const canUndo = useEditorStore((s) => s.canUndo());
  const canRedo = useEditorStore((s) => s.canRedo());
  const isDirty = useEditorStore((s) => s.isDirty);
  const snapEnabled = useEditorStore((s) => s.snapEnabled);
  const toggleSnap = useEditorStore((s) => s.toggleSnap);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-[14px] border border-black/[0.08] bg-white px-4 py-3 shadow-sm">
      <Button variant="outline" size="sm" onClick={() => addTextElement()}>
        <Type className="h-3.5 w-3.5" />
        Text
      </Button>
      <Button variant="outline" size="sm" onClick={() => addSectionBlock("experience")}>
        <LayoutTemplate className="h-3.5 w-3.5" />
        Section
      </Button>
      <div className="mx-1 h-6 w-px bg-black/[0.08]" />
      <Button variant="ghost" size="icon" disabled={!canUndo} onClick={undo} title="Undo">
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" disabled={!canRedo} onClick={redo} title="Redo">
        <Redo2 className="h-4 w-4" />
      </Button>
      {selectedId && (
        <>
          <div className="mx-1 h-6 w-px bg-black/[0.08]" />
          <Button variant="ghost" size="icon" onClick={() => bringForward(selectedId)}>
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => sendBackward(selectedId)}>
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => removeElement(selectedId)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </>
      )}
      <Button
        variant={snapEnabled ? "secondary" : "ghost"}
        size="icon"
        onClick={toggleSnap}
        title="Toggle snap to grid (Ctrl+G)"
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
      <div className="flex-1" />
      {onAiRewrite && (
        <Button variant="outline" size="sm" onClick={onAiRewrite} disabled={aiLoading}>
          <Sparkles className="h-3.5 w-3.5" />
          {aiLoading ? "AI…" : "AI Rewrite"}
        </Button>
      )}
      <Button variant="outline" size="sm" onClick={onSave} disabled={saving || !isDirty}>
        {saving ? "Saving…" : "Save"}
      </Button>
      <Button size="sm" onClick={onExport}>
        Export PDF
      </Button>
    </div>
  );
}

export const Toolbar = memo(ToolbarInner);
