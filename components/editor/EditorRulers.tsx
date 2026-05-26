"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

interface EditorRulersProps {
  width: number;
  height: number;
  className?: string;
}

const TICK_INTERVAL = 50;

function EditorRulersInner({ width, height, className }: EditorRulersProps) {
  const hTicks = Math.floor(width / TICK_INTERVAL);
  const vTicks = Math.floor(height / TICK_INTERVAL);

  return (
    <div className={cn("pointer-events-none absolute inset-0 z-10", className)}>
      {/* Horizontal ruler */}
      <div className="absolute left-8 top-0 flex h-6 border-b border-zinc-200 bg-zinc-50/90" style={{ width }}>
        {Array.from({ length: hTicks + 1 }).map((_, i) => (
          <div
            key={`h-${i}`}
            className="relative border-l border-zinc-300/60"
            style={{ width: TICK_INTERVAL, minWidth: TICK_INTERVAL }}
          >
            <span className="absolute left-0.5 top-0.5 text-[8px] text-zinc-400">{i * TICK_INTERVAL}</span>
          </div>
        ))}
      </div>
      {/* Vertical ruler */}
      <div className="absolute left-0 top-8 flex w-6 flex-col border-r border-zinc-200 bg-zinc-50/90" style={{ height }}>
        {Array.from({ length: vTicks + 1 }).map((_, i) => (
          <div
            key={`v-${i}`}
            className="relative border-t border-zinc-300/60"
            style={{ height: TICK_INTERVAL, minHeight: TICK_INTERVAL }}
          >
            <span className="absolute left-0.5 top-0.5 text-[8px] text-zinc-400">{i * TICK_INTERVAL}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const EditorRulers = memo(EditorRulersInner);
