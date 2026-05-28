"use client";

import { memo } from "react";
import { useEditorStore } from "@/lib/editor-store";
import { SECTION_STYLE_OPTIONS } from "@/lib/section-styles";
import type { SectionDisplayStyle } from "@/types/cv-document";
import { cn } from "@/lib/utils";

function StudioSectionStylePanelInner() {
  const selectedId = useEditorStore((s) => s.selectedId);
  const elements = useEditorStore((s) => s.elements);
  const updateElement = useEditorStore((s) => s.updateElement);

  const selected = elements.find((e) => e.id === selectedId);
  if (!selected || selected.type !== "section") {
    return (
      <p className="text-xs text-zinc-400">
        Select an experience or section block to change its style.
      </p>
    );
  }

  const current = selected.sectionStyle ?? "default";

  return (
    <div className="grid grid-cols-2 gap-2">
      {SECTION_STYLE_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() =>
            updateElement(selected.id, { sectionStyle: opt.id as SectionDisplayStyle })
          }
          className={cn(
            "rounded-xl border p-3 text-left transition",
            current === opt.id
              ? "border-zinc-900 bg-zinc-50"
              : "border-zinc-200 hover:border-zinc-300"
          )}
        >
          <span className="block text-xs font-semibold text-zinc-800">{opt.label}</span>
          <span className="mt-0.5 block text-[10px] text-zinc-400">{opt.description}</span>
        </button>
      ))}
    </div>
  );
}

export const StudioSectionStylePanel = memo(StudioSectionStylePanelInner);
