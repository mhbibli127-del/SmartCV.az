"use client";

import { memo, useCallback, useRef, useEffect } from "react";
import { Rnd } from "react-rnd";
import { Copy, Lock, Trash2, Unlock } from "lucide-react";
import type { CvEditorElement } from "@/types/cv-editor";
import { useCvEditorStore } from "@/store/cv-editor-store";
import { MIN_ELEMENT_HEIGHT, MIN_ELEMENT_WIDTH } from "@/lib/layout-engine";
import { cn } from "@/lib/utils";

interface CanvasElementProps {
  element: CvEditorElement;
  scale: number;
}

function CanvasElementInner({ element, scale }: CanvasElementProps) {
  const selectedId = useCvEditorStore((s) => s.selectedId);
  const editingId = useCvEditorStore((s) => s.editingId);
  const selectElement = useCvEditorStore((s) => s.selectElement);
  const setEditingId = useCvEditorStore((s) => s.setEditingId);
  const updateElement = useCvEditorStore((s) => s.updateElement);
  const moveElement = useCvEditorStore((s) => s.moveElement);
  const resizeElement = useCvEditorStore((s) => s.resizeElement);
  const removeElement = useCvEditorStore((s) => s.removeElement);
  const duplicateElement = useCvEditorStore((s) => s.duplicateElement);
  const toggleLock = useCvEditorStore((s) => s.toggleLock);

  const editRef = useRef<HTMLDivElement>(null);
  const isSelected = selectedId === element.id;
  const isEditing = editingId === element.id;

  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
      const range = document.createRange();
      range.selectNodeContents(editRef.current);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing]);

  const finishEdit = useCallback(() => {
    if (editRef.current) {
      updateElement(element.id, { content: editRef.current.innerText });
    }
    setEditingId(null);
  }, [element.id, setEditingId, updateElement]);

  const style = element.style;

  const contentNode =
    element.type === "image" ? (
      element.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={element.src}
          alt=""
          className="h-full w-full object-cover"
          style={{ borderRadius: style.borderRadius }}
          draggable={false}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center text-xs text-white/80"
          style={{
            background: style.background ?? "#71717a",
            borderRadius: style.borderRadius,
            opacity: style.opacity ?? 1,
          }}
        >
          Photo
        </div>
      )
    ) : (
      <div
        ref={editRef}
        contentEditable={isEditing && !element.locked}
        suppressContentEditableWarning
        onBlur={finishEdit}
        onClick={(e) => {
          e.stopPropagation();
          if (!element.locked && element.type !== "image") {
            selectElement(element.id);
            setEditingId(element.id);
          }
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
        }}
        className={cn(
          "h-full w-full overflow-hidden outline-none",
          isEditing && "cursor-text ring-2 ring-blue-400 ring-offset-1"
        )}
        style={{
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          fontStyle: style.fontStyle,
          textDecoration: style.textDecoration,
          textAlign: style.textAlign,
          color: style.color,
          background: style.background,
          borderRadius: style.borderRadius,
          opacity: style.opacity ?? 1,
          fontFamily: style.fontFamily,
          lineHeight: style.lineHeight,
          letterSpacing: style.letterSpacing,
          padding: style.padding,
          border: style.border,
          boxShadow: style.boxShadow,
          textShadow: style.textShadow,
          whiteSpace: "pre-wrap",
        }}
      >
        {element.content}
      </div>
    );

  return (
    <Rnd
      size={{ width: element.width, height: element.height }}
      position={{ x: element.x, y: element.y }}
      scale={scale}
      disableDragging={element.locked}
      enableResizing={!element.locked && isSelected}
      minWidth={MIN_ELEMENT_WIDTH}
      minHeight={MIN_ELEMENT_HEIGHT}
      bounds="parent"
      onDragStop={(_e, d) => moveElement(element.id, d.x, d.y)}
      onResizeStop={(_e, _dir, ref, _delta, pos) =>
        resizeElement(element.id, {
          width: parseInt(ref.style.width, 10),
          height: parseInt(ref.style.height, 10),
          x: pos.x,
          y: pos.y,
        })
      }
      onMouseDown={(e) => {
        e.stopPropagation();
        selectElement(element.id);
      }}
      style={{ zIndex: element.zIndex }}
      className={cn(
        "group",
        isSelected && "ring-2 ring-blue-500 ring-offset-0"
      )}
    >
      {contentNode}

      {isSelected && !element.locked && (
        <div className="absolute -top-9 left-0 flex gap-1 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg">
          <button
            type="button"
            title="Duplicate"
            onClick={(e) => {
              e.stopPropagation();
              duplicateElement(element.id);
            }}
            className="rounded p-1 hover:bg-zinc-100"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              removeElement(element.id);
            }}
            className="rounded p-1 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {isSelected && (
        <button
          type="button"
          title={element.locked ? "Unlock" : "Lock"}
          onClick={(e) => {
            e.stopPropagation();
            toggleLock(element.id);
          }}
          className="absolute -top-9 right-0 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-lg hover:bg-zinc-50"
        >
          {element.locked ? (
            <Lock className="h-3.5 w-3.5 text-amber-600" />
          ) : (
            <Unlock className="h-3.5 w-3.5 text-zinc-500" />
          )}
        </button>
      )}
    </Rnd>
  );
}

export const CanvasElement = memo(CanvasElementInner);
