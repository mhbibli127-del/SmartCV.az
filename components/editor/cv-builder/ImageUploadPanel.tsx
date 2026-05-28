"use client";

import { memo, useCallback, useRef, useState } from "react";
import { ImagePlus, Upload } from "lucide-react";
import { useCvEditorStore } from "@/store/cv-editor-store";
import { cn } from "@/lib/utils";

function ImageUploadPanelInner() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const addImageElement = useCvEditorStore((s) => s.addImageElement);
  const selectedId = useCvEditorStore((s) => s.selectedId);
  const updateElement = useCvEditorStore((s) => s.updateElement);
  const elements = useCvEditorStore((s) => s.elements);

  const selected = elements.find((e) => e.id === selectedId);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        const src = reader.result as string;
        if (selected?.type === "image") {
          updateElement(selected.id, { src });
        } else {
          addImageElement(src);
        }
      };
      reader.readAsDataURL(file);
    },
    [addImageElement, selected, updateElement]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={cn(
        "rounded-xl border-2 border-dashed p-4 text-center transition",
        dragOver ? "border-blue-400 bg-blue-50" : "border-zinc-200 bg-zinc-50"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <ImagePlus className="mx-auto h-8 w-8 text-zinc-400" />
      <p className="mt-2 text-xs font-medium text-zinc-700">Profile photo</p>
      <p className="mt-1 text-[10px] text-zinc-500">Drag & drop or click to upload</p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
      >
        <Upload className="h-3.5 w-3.5" />
        Upload image
      </button>
    </div>
  );
}

export const ImageUploadPanel = memo(ImageUploadPanelInner);
