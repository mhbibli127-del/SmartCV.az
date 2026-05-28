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
import { GripVertical } from "lucide-react";
import { useEditorStore } from "@/lib/editor-store";
import type { EditorElement } from "@/types/cv-document";
import { cn } from "@/lib/utils";

function elementLabel(el: EditorElement): string {
  if (el.type === "section") return (el.sectionType ?? "Section").replace(/^\w/, (c) => c.toUpperCase());
  if (el.type === "text") return (el.text ?? "Text").slice(0, 32) || "Text";
  if (el.type === "image") return "Image";
  if (el.type === "divider") return "Divider";
  if (el.type === "shape") return "Shape";
  return el.type;
}

function SortableRow({ element }: { element: EditorElement }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: element.id,
  });
  const selectElement = useEditorStore((s) => s.selectElement);
  const selectedId = useEditorStore((s) => s.selectedId);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      onClick={() => selectElement(element.id)}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg border px-2 py-2 text-left text-xs transition",
        selectedId === element.id
          ? "border-zinc-900 bg-zinc-50"
          : "border-zinc-200 bg-white hover:border-zinc-300",
        isDragging && "z-10 opacity-90 shadow-md"
      )}
    >
      <span
        className="cursor-grab touch-none text-zinc-400 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1 truncate font-medium text-zinc-700">
        {elementLabel(element)}
      </span>
    </button>
  );
}

function StudioSectionOrderInner() {
  const elements = useEditorStore((s) => s.elements);
  const reorderElements = useEditorStore((s) => s.reorderElements);

  const sorted = useMemo(
    () => [...elements].sort((a, b) => a.y - b.y || a.zIndex - b.zIndex),
    [elements]
  );
  const ids = sorted.map((e) => e.id);

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
    reorderElements(next);
  };

  if (sorted.length === 0) {
    return <p className="text-xs text-zinc-400">No sections yet. Add blocks from Content.</p>;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {sorted.map((el) => (
            <SortableRow key={el.id} element={el} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

export const StudioSectionOrder = memo(StudioSectionOrderInner);
