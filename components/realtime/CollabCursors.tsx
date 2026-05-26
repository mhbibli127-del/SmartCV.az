"use client";

import { memo, useEffect } from "react";
import { useOthers, useUpdateMyPresence } from "@/lib/liveblocks/client";

/** Renders collaborator cursors when Liveblocks is active. */
function CollabCursorsInner() {
  const others = useOthers();
  const updatePresence = useUpdateMyPresence();

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      updatePresence({ cursor: { x: e.clientX, y: e.clientY } });
    };
    const onLeave = () => updatePresence({ cursor: null });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [updatePresence]);

  return (
    <>
      {others.map(({ connectionId, presence, info }) => {
        const cursor = presence?.cursor as { x: number; y: number } | null | undefined;
        if (!cursor) return null;
        const name = (info as { name?: string })?.name ?? "Collaborator";
        return (
          <div
            key={connectionId}
            className="pointer-events-none fixed z-[9999]"
            style={{ left: cursor.x, top: cursor.y }}
          >
            <div className="h-2 w-2 rounded-full bg-violet-500 ring-2 ring-white" />
            <span className="ml-2 rounded bg-violet-600 px-1.5 py-0.5 text-[10px] text-white">
              {name}
            </span>
          </div>
        );
      })}
    </>
  );
}

export const CollabCursors = memo(CollabCursorsInner);
