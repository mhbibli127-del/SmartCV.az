"use client";

import { memo } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TextAlign = "left" | "center" | "right";

interface StudioTextStyleControlsProps {
  textAlign?: TextAlign;
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  onTextAlign: (align: TextAlign) => void;
  onFontWeight: (weight: "normal" | "bold") => void;
  onFontStyle: (style: "normal" | "italic") => void;
}

function StudioTextStyleControlsInner({
  textAlign = "left",
  fontWeight = "normal",
  fontStyle = "normal",
  onTextAlign,
  onFontWeight,
  onFontStyle,
}: StudioTextStyleControlsProps) {
  const toggleClass = (active: boolean) =>
    cn(
      "rounded-lg border p-2 transition",
      active
        ? "border-zinc-900 bg-zinc-900 text-white"
        : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
    );

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium uppercase text-zinc-400">Text style</p>
      <div className="flex gap-1">
        <button
          type="button"
          title="Align left"
          onClick={() => onTextAlign("left")}
          className={toggleClass(textAlign === "left")}
        >
          <AlignLeft className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          title="Align center"
          onClick={() => onTextAlign("center")}
          className={toggleClass(textAlign === "center")}
        >
          <AlignCenter className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          title="Align right"
          onClick={() => onTextAlign("right")}
          className={toggleClass(textAlign === "right")}
        >
          <AlignRight className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          title="Bold"
          onClick={() => onFontWeight(fontWeight === "bold" ? "normal" : "bold")}
          className={toggleClass(fontWeight === "bold")}
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          title="Italic"
          onClick={() => onFontStyle(fontStyle === "italic" ? "normal" : "italic")}
          className={toggleClass(fontStyle === "italic")}
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export const StudioTextStyleControls = memo(StudioTextStyleControlsInner);
