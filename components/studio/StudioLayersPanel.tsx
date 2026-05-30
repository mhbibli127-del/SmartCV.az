"use client";

import { memo, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  Eye,
  Lock,
  Type,
  Image as ImageIcon,
  Minus,
  Square,
} from "lucide-react";
import { useEditorStore } from "@/lib/editor-store";
import { cn } from "@/lib/utils";
import type { EditorElement } from "@/types/cv-document";

function layerIcon(el: EditorElement) {
  switch (el.type) {
    case "text":
      return Type;
    case "image":
      return ImageIcon;
    case "shape":
      return Square;
    case "divider":
      return Minus;
    default:
      return Eye;
  }
}

function layerLabel(el: EditorElement): string {
  if (el.type === "text") return el.text?.slice(0, 28) || "Text";
  if (el.type === "section") return el.sectionType ?? "Section";
  if (el.type === "image") return el.id === "avatar" ? "Photo" : "Image";
  if (el.type === "shape") return el.shapeType ?? "Shape";
  if (el.type === "divider") return "Divider";
  return el.type;
}

function SortableLayerRow({ element }: { element: EditorElement }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: element.id,
  });
  const selectElement = useEditorStore((s) => s.selectElement);
  const selectedId = useEditorStore((s) => s.selectedId);
  const bringForward = useEditorStore((s) => s.bringForward);
  const sendBackward = useEditorStore((s) => s.sendBackward);
  const toggleElementLock = useEditorStore((s) => s.toggleElementLock);

  const Icon = layerIcon(element);
  const selected = selectedId === element.id;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-1 rounded-lg border px-1.5 py-1 transition",
        selected
          ? "border-zinc-900 bg-zinc-50"
          : "border-transparent hover:border-zinc-200 hover:bg-zinc-50/80",
        isDragging && "z-10 opacity-90 shadow-md"
      )}
    >
      <span
        className="cursor-grab touch-none rounded p-1 text-zinc-400 active:cursor-grabbing"
        title="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </span>
      <button
        type="button"
        onClick={() => selectElement(element.id)}
        className="flex min-w-0 flex-1 items-center gap-2 py-0.5 text-left"
      >
        <Icon className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
        <span className="truncate text-xs font-medium text-zinc-700">
          {layerLabel(element)}
        </span>
        {element.locked && <Lock className="h-3 w-3 shrink-0 text-zinc-400" />}
      </button>
      <div className="flex shrink-0 gap-0.5 opacity-0 transition group-hover:opacity-100">
        <button
          type="button"
          title="Bring forward"
          onClick={() => bringForward(element.id)}
          className="rounded p-1 text-zinc-500 hover:bg-white hover:text-zinc-900"
        >
          <ArrowUp className="h-3 w-3" />
        </button>
        <button
          type="button"
          title="Send backward"
          onClick={() => sendBackward(element.id)}
          className="rounded p-1 text-zinc-500 hover:bg-white hover:text-zinc-900"
        >
          <ArrowDown className="h-3 w-3" />
        </button>
        <button
          type="button"
          title={element.locked ? "Unlock" : "Lock"}
          onClick={() => toggleElementLock(element.id)}
          className="rounded p-1 text-zinc-500 hover:bg-white hover:text-zinc-900"
        >
          <Lock className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function StudioLayersPanelInner() {
  const activePage = useEditorStore((s) => s.activePage);
  const elements = useEditorStore((s) => s.elements);
  const reorderLayers = useEditorStore((s) => s.reorderLayers);

  const layers = useMemo(
    () =>
      elements
        .filter((el) => (el.page ?? 1) === activePage)
        .sort((a, b) => b.zIndex - a.zIndex),
    [elements, activePage]
  );

  const ids = layers.map((el) => el.id);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const next = [...ids];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved!);
    reorderLayers(next);
  };

  if (layers.length === 0) {
    return (
      <p className="text-xs text-zinc-400">
        No elements on this page. Add blocks from the Content tab.
      </p>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="space-y-1">
          {layers.map((el) => (
            <SortableLayerRow key={el.id} element={el} />
          ))}
        </div>
      </SortableContext>
      <p className="pt-2 text-[10px] text-zinc-400">
        Drag layers to change stacking. Top = front. [ ] keys also work.
      </p>
    </DndContext>
  );
}

export const StudioLayersPanel = memo(StudioLayersPanelInner);
