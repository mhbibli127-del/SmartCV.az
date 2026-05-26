"use client";

import { memo } from "react";
import { Users, Wifi, WifiOff } from "lucide-react";
import type { CollabPresence } from "@/lib/realtime/collab-session-store";
import { cn } from "@/lib/utils";

type Props = {
  presence: CollabPresence[];
  connected: boolean;
  enabled?: boolean;
};

function CollabBarInner({ presence, connected, enabled = true }: Props) {
  if (!enabled) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-xs shadow-sm">
      {connected ? (
        <Wifi className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <WifiOff className="h-3.5 w-3.5 text-zinc-400" />
      )}
      <span className="font-medium text-zinc-600">Live collab</span>
      <div className="flex -space-x-2">
        {presence.slice(0, 5).map((p) => (
          <span
            key={p.userId}
            title={p.name}
            className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-semibold text-white"
            style={{ background: p.color }}
          >
            {p.name.charAt(0).toUpperCase()}
          </span>
        ))}
      </div>
      {presence.length === 0 && (
        <span className="flex items-center gap-1 text-zinc-400">
          <Users className="h-3.5 w-3.5" />
          Only you
        </span>
      )}
      <span className={cn("ml-auto", connected ? "text-emerald-600" : "text-zinc-400")}>
        {connected ? "Synced" : "Connecting…"}
      </span>
    </div>
  );
}

export const CollabBar = memo(CollabBarInner);
