"use client";

import { memo } from "react";
import { Line } from "react-konva";
import { useEditorStore } from "@/lib/editor-store";
import { A4_HEIGHT, A4_WIDTH } from "@/lib/layout-engine";

function AlignmentGuidesInner() {
  const guides = useEditorStore((s) => s.alignmentGuides);

  if (guides.length === 0) return null;

  return (
    <>
      {guides.map((g, i) =>
        g.orientation === "vertical" ? (
          <Line
            key={`v-${i}`}
            points={[g.position, 0, g.position, A4_HEIGHT]}
            stroke="#6366f1"
            strokeWidth={1}
            dash={[4, 4]}
            listening={false}
          />
        ) : (
          <Line
            key={`h-${i}`}
            points={[0, g.position, A4_WIDTH, g.position]}
            stroke="#6366f1"
            strokeWidth={1}
            dash={[4, 4]}
            listening={false}
          />
        )
      )}
    </>
  );
}

export const AlignmentGuides = memo(AlignmentGuidesInner);
