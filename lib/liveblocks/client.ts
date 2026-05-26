"use client";

import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";
import { isLiveblocksConfigured } from "@/lib/utils/liveblocks/env";

const client = createClient({
  authEndpoint: async (room) => {
    const res = await fetch("/api/liveblocks-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ cvId: room, room }),
    });
    if (!res.ok) {
      throw new Error("Liveblocks auth failed");
    }
    return res.json();
  },
  throttle: 16,
});

const ctx = createRoomContext(client);

export const RoomProvider = ctx.RoomProvider;
export const useOthers = ctx.useOthers;
export const useMyPresence = ctx.useMyPresence;
export const useUpdateMyPresence = ctx.useUpdateMyPresence;
export const useStatus = ctx.useStatus;

export function isCollabEnabled(): boolean {
  return isLiveblocksConfigured();
}
