"use client";

import { memo } from "react";
import { Plus } from "lucide-react";
import { useEditorStore } from "@/lib/editor-store";
import { cn } from "@/lib/utils";

function StudioPageNavigatorInner() {
  const pageCount = useEditorStore((s) => s.pageCount);
  const activePage = useEditorStore((s) => s.activePage);
  const setActivePage = useEditorStore((s) => s.setActivePage);
  const addPage = useEditorStore((s) => s.addPage);

  return (
    <div className="flex shrink-0 items-center justify-center gap-2 border-t border-zinc-200 bg-white px-4 py-2">
      {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => setActivePage(page)}
          className={cn(
            "min-w-[2.5rem] rounded-lg px-3 py-1.5 text-xs font-medium transition",
            activePage === page
              ? "bg-zinc-900 text-white"
              : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
          )}
        >
          Page {page}
        </button>
      ))}
      <button
        type="button"
        onClick={addPage}
        className="flex items-center gap-1 rounded-lg border border-dashed border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-500 hover:border-zinc-400 hover:bg-zinc-50"
      >
        <Plus className="h-3.5 w-3.5" />
        Add page
      </button>
    </div>
  );
}

export const StudioPageNavigator = memo(StudioPageNavigatorInner);
