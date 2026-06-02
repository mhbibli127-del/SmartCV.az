"use client";

import { memo } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Copy,
  Clipboard,
  ClipboardPaste,
  Lock,
  LockOpen,
  RotateCcw,
  Trash2,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
} from "lucide-react";
import { useEditorStore } from "@/lib/editor-store";
import { A4_WIDTH, A4_HEIGHT } from "@/lib/layout-engine";
import { useOptionalLanguage } from "@/components/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

const NUDGE = 4;
const NUDGE_SHIFT = 16;

function ToolBtn({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 rounded-xl border border-zinc-200 p-2.5 text-[10px] font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 disabled:opacity-40"
      )}
    >
      {children}
    </button>
  );
}

function StudioQuickToolsPanelInner() {
  const lang = useOptionalLanguage();
  const t = lang?.t ?? ((k: string) => k);
  const selectedId = useEditorStore((s) => s.selectedId);
  const elements = useEditorStore((s) => s.elements);
  const updateElement = useEditorStore((s) => s.updateElement);
  const removeElement = useEditorStore((s) => s.removeElement);
  const duplicateElement = useEditorStore((s) => s.duplicateElement);
  const copyElement = useEditorStore((s) => s.copyElement);
  const pasteElement = useEditorStore((s) => s.pasteElement);
  const bringForward = useEditorStore((s) => s.bringForward);
  const sendBackward = useEditorStore((s) => s.sendBackward);
  const toggleElementLock = useEditorStore((s) => s.toggleElementLock);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const canUndo = useEditorStore((s) => s.canUndo);
  const canRedo = useEditorStore((s) => s.canRedo);

  const selected = elements.find((e) => e.id === selectedId);
  const opacity =
    selected && "opacity" in selected && typeof selected.opacity === "number"
      ? selected.opacity
      : 1;

  const nudge = (dx: number, dy: number) => {
    if (!selected || selected.locked) return;
    updateElement(selected.id, { x: selected.x + dx, y: selected.y + dy });
  };

  const centerOnPage = (axis: "x" | "y") => {
    if (!selected || selected.locked) return;
    const w = "width" in selected ? Number(selected.width) || 0 : 0;
    const h = "height" in selected ? Number(selected.height) || 0 : 0;
    if (axis === "x") {
      updateElement(selected.id, { x: Math.round((A4_WIDTH - w) / 2) });
    } else {
      updateElement(selected.id, { y: Math.round((A4_HEIGHT - h) / 2) });
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-500">{t("studio.quickTools")}</p>

      <div className="grid grid-cols-3 gap-2">
        <ToolBtn title="Undo" onClick={undo} disabled={!canUndo()}>
          <RotateCcw className="h-4 w-4" />
          Undo
        </ToolBtn>
        <ToolBtn title="Redo" onClick={redo} disabled={!canRedo()}>
          <RotateCcw className="h-4 w-4 scale-x-[-1]" />
          Redo
        </ToolBtn>
        <ToolBtn
          title="Duplicate"
          onClick={() => selectedId && duplicateElement(selectedId)}
          disabled={!selectedId}
        >
          <Copy className="h-4 w-4" />
          Duplicate
        </ToolBtn>
        <ToolBtn
          title="Copy"
          onClick={() => selectedId && copyElement(selectedId)}
          disabled={!selectedId}
        >
          <Clipboard className="h-4 w-4" />
          Copy
        </ToolBtn>
        <ToolBtn title="Paste" onClick={pasteElement}>
          <ClipboardPaste className="h-4 w-4" />
          Paste
        </ToolBtn>
        <ToolBtn
          title="Delete"
          onClick={() => selectedId && removeElement(selectedId)}
          disabled={!selectedId}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
          Delete
        </ToolBtn>
      </div>

      <p className="text-[11px] font-semibold uppercase text-zinc-400">Move</p>
      <div className="grid grid-cols-3 gap-1 max-w-[140px]">
        <span />
        <ToolBtn title="Up" onClick={() => nudge(0, -NUDGE)} disabled={!selected}>
          <ArrowUp className="h-4 w-4" />
        </ToolBtn>
        <span />
        <ToolBtn title="Left" onClick={() => nudge(-NUDGE, 0)} disabled={!selected}>
          <ArrowLeft className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn title="Down" onClick={() => nudge(0, NUDGE)} disabled={!selected}>
          <ArrowDown className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn title="Right" onClick={() => nudge(NUDGE, 0)} disabled={!selected}>
          <ArrowRight className="h-4 w-4" />
        </ToolBtn>
      </div>

      <p className="text-[11px] font-semibold uppercase text-zinc-400">Transform</p>
      <div className="grid grid-cols-2 gap-2">
        <ToolBtn
          title={selected?.locked ? t("studio.unlock") : t("studio.lock")}
          onClick={() => selectedId && toggleElementLock(selectedId)}
          disabled={!selectedId}
        >
          {selected?.locked ? (
            <LockOpen className="h-4 w-4" />
          ) : (
            <Lock className="h-4 w-4" />
          )}
          {selected?.locked ? t("studio.unlock") : t("studio.lock")}
        </ToolBtn>
        <ToolBtn
          title={t("studio.centerH")}
          onClick={() => centerOnPage("x")}
          disabled={!selected}
        >
          <AlignHorizontalJustifyCenter className="h-4 w-4" />
          {t("studio.centerH")}
        </ToolBtn>
        <ToolBtn
          title={t("studio.centerV")}
          onClick={() => centerOnPage("y")}
          disabled={!selected}
        >
          <AlignVerticalJustifyCenter className="h-4 w-4" />
          {t("studio.centerV")}
        </ToolBtn>
      </div>

      {selected && "opacity" in selected && (
        <div>
          <label className="text-[11px] font-semibold uppercase text-zinc-400">
            {t("studio.opacity")} ({Math.round(opacity * 100)}%)
          </label>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={opacity}
            disabled={selected.locked}
            onChange={(e) =>
              updateElement(selected.id, {
                opacity: parseFloat(e.target.value),
              })
            }
            className="mt-2 w-full accent-zinc-900"
          />
        </div>
      )}

      <p className="text-[11px] font-semibold uppercase text-zinc-400">Layer</p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!selectedId}
          onClick={() => selectedId && bringForward(selectedId)}
          className="flex-1 rounded-lg border border-zinc-200 py-2 text-xs font-medium hover:bg-zinc-50 disabled:opacity-40"
        >
          Forward
        </button>
        <button
          type="button"
          disabled={!selectedId}
          onClick={() => selectedId && sendBackward(selectedId)}
          className="flex-1 rounded-lg border border-zinc-200 py-2 text-xs font-medium hover:bg-zinc-50 disabled:opacity-40"
        >
          Back
        </button>
      </div>

      <p className="text-[10px] leading-relaxed text-zinc-400">
        Shift+oxlar 8px addım. Ctrl+C/V, Ctrl+D, Ctrl+Z də işləyir.
      </p>
    </div>
  );
}

export const StudioQuickToolsPanel = memo(StudioQuickToolsPanelInner);
