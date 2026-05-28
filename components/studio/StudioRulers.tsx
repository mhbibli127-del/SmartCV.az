"use client";

import { memo } from "react";
import { A4_HEIGHT, A4_WIDTH, GRID_SIZE } from "@/lib/layout-engine";

function StudioRulersInner({ zoom }: { zoom: number }) {
  const hTicks = Math.floor(A4_WIDTH / GRID_SIZE);
  const vTicks = Math.floor(A4_HEIGHT / GRID_SIZE);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[5]"
      style={{ width: A4_WIDTH * zoom, height: A4_HEIGHT * zoom }}
    >
      <div
        className="absolute left-0 top-0 flex border-b border-zinc-300/60 bg-zinc-100/80"
        style={{ width: A4_WIDTH * zoom, height: 20 }}
      >
        {Array.from({ length: Math.min(hTicks, 40) }).map((_, i) => (
          <div
            key={`h-${i}`}
            className="border-r border-zinc-300/40"
            style={{ width: GRID_SIZE * zoom, height: i % 5 === 0 ? 20 : 10 }}
          />
        ))}
      </div>
      <div
        className="absolute left-0 top-0 flex flex-col border-r border-zinc-300/60 bg-zinc-100/80"
        style={{ width: 20, height: A4_HEIGHT * zoom }}
      >
        {Array.from({ length: Math.min(vTicks, 40) }).map((_, i) => (
          <div
            key={`v-${i}`}
            className="border-b border-zinc-300/40"
            style={{ height: GRID_SIZE * zoom, width: i % 5 === 0 ? 20 : 10 }}
          />
        ))}
      </div>
    </div>
  );
}

export const StudioRulers = memo(StudioRulersInner);
