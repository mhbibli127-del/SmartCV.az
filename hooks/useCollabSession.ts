"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/lib/editor-store";
import type { CollabPresence } from "@/lib/realtime/collab-session-store";
import type { EditorElement } from "@/types/cv-document";

const COLORS = ["#6366f1", "#ec4899", "#14b8a6", "#f59e0b", "#ef4444"];

function colorForUser(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length]!;
}

export function useCollabSession(cvId: string | null, userEmail: string | null, userName?: string) {
  const [presence, setPresence] = useState<CollabPresence[]>([]);
  const [connected, setConnected] = useState(false);
  const versionRef = useRef(0);
  const isRemoteUpdate = useRef(false);

  const pushLocal = useCallback(async () => {
    if (!cvId || !userEmail || isRemoteUpdate.current) return;
    const elements = useEditorStore.getState().elements;
    versionRef.current = Date.now();
    await fetch(`/api/v1/collab/${cvId}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "sync",
        elements,
        version: versionRef.current,
      }),
    }).catch(() => {});
  }, [cvId, userEmail]);

  const pushPresence = useCallback(async () => {
    if (!cvId || !userEmail) return;
    const { selectedId } = useEditorStore.getState();
    await fetch(`/api/v1/collab/${cvId}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "presence",
        presence: {
          userId: userEmail,
          name: userName ?? userEmail.split("@")[0],
          color: colorForUser(userEmail),
          selectedId,
        },
      }),
    }).catch(() => {});
  }, [cvId, userEmail, userName]);

  const pullRemote = useCallback(async () => {
    if (!cvId) return;
    const res = await fetch(`/api/v1/collab/${cvId}?since=${versionRef.current}`, {
      credentials: "include",
    });
    if (!res.ok) return;
    const data = await res.json();
    setPresence(data.presence ?? []);
    setConnected(true);

    if (!data.unchanged && Array.isArray(data.elements) && data.elements.length > 0) {
      isRemoteUpdate.current = true;
      useEditorStore.getState().loadElements(data.elements as EditorElement[]);
      versionRef.current = data.version ?? versionRef.current;
      isRemoteUpdate.current = false;
    }
  }, [cvId]);

  useEffect(() => {
    if (!cvId || !userEmail) return;

    pullRemote();
    const interval = setInterval(() => {
      pullRemote();
      pushPresence();
    }, 2500);

    return () => clearInterval(interval);
  }, [cvId, userEmail, pullRemote, pushPresence]);

  useEffect(() => {
    if (!cvId || !userEmail) return;
    const unsub = useEditorStore.subscribe((state, prev) => {
      if (state.elements !== prev.elements && state.isDirty) {
        void pushLocal();
      }
    });
    return unsub;
  }, [cvId, userEmail, pushLocal]);

  return { presence, connected };
}
