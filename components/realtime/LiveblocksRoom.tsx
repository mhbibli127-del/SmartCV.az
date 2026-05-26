"use client";

import { memo } from "react";
import { RoomProvider, useOthers, isCollabEnabled } from "@/lib/liveblocks/client";
import { roomIdForCv } from "@/lib/liveblocks/room";
import { CollabCursors } from "@/components/realtime/CollabCursors";

interface LiveblocksRoomProps {
  cvId: string | null;
  children: React.ReactNode;
}

function LiveblocksRoomInner({ cvId, children }: LiveblocksRoomProps) {
  if (!cvId || !isCollabEnabled()) {
    return <>{children}</>;
  }

  return (
    <RoomProvider id={roomIdForCv(cvId)} initialPresence={{ cursor: null }}>
      <CollabCursors />
      {children}
    </RoomProvider>
  );
}

export const LiveblocksRoom = memo(LiveblocksRoomInner);

export { useOthers, isCollabEnabled };
