import { Liveblocks } from "@liveblocks/node";
import { getLiveblocksSecretKey, isLiveblocksConfigured } from "@/lib/env";
import { roomIdForCv } from "@/lib/liveblocks/room";

export { roomIdForCv };

let liveblocks: Liveblocks | null = null;

export function getLiveblocksServer(): Liveblocks | null {
  if (!isLiveblocksConfigured()) return null;
  if (!liveblocks) {
    liveblocks = new Liveblocks({ secret: getLiveblocksSecretKey()! });
  }
  return liveblocks;
}
