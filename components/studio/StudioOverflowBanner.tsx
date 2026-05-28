"use client";

import { memo, useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { getOverflowElements } from "@/lib/page-overflow";
import { useEditorStore } from "@/lib/editor-store";

function StudioOverflowBannerInner() {
  const elements = useEditorStore((s) => s.elements);
  const activePage = useEditorStore((s) => s.activePage);
  const moveOverflowToNextPage = useEditorStore((s) => s.moveOverflowToNextPage);

  const overflowCount = useMemo(
    () => getOverflowElements(elements, activePage).length,
    [elements, activePage]
  );

  if (overflowCount === 0) return null;

  return (
    <div className="mx-4 mb-2 flex shrink-0 items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 sm:mx-8">
      <div className="flex min-w-0 items-center gap-2 text-sm text-amber-900">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>
          {overflowCount} element{overflowCount > 1 ? "s" : ""} overflow page {activePage}
        </span>
      </div>
      <button
        type="button"
        onClick={moveOverflowToNextPage}
        className="shrink-0 rounded-lg bg-amber-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-800"
      >
        Move to next page
      </button>
    </div>
  );
}

export const StudioOverflowBanner = memo(StudioOverflowBannerInner);
