import type { EditorElement } from "@/types/cv-document";

export interface CollabPresence {
  userId: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
  selectedId?: string | null;
  updatedAt: number;
}

export interface CollabSessionState {
  cvId: string;
  elements: EditorElement[];
  presence: CollabPresence[];
  version: number;
  updatedAt: number;
}

const sessions = new Map<string, CollabSessionState>();
const TTL_MS = 1000 * 60 * 30;

function freshSession(cvId: string): CollabSessionState {
  return {
    cvId,
    elements: [],
    presence: [],
    version: 0,
    updatedAt: Date.now(),
  };
}

export function getCollabSession(cvId: string): CollabSessionState {
  const existing = sessions.get(cvId);
  if (!existing || Date.now() - existing.updatedAt > TTL_MS) {
    const session = freshSession(cvId);
    sessions.set(cvId, session);
    return session;
  }
  return existing;
}

export function syncCollabElements(
  cvId: string,
  elements: EditorElement[],
  version: number
): CollabSessionState {
  const session = getCollabSession(cvId);
  if (version >= session.version) {
    session.elements = elements;
    session.version = version;
    session.updatedAt = Date.now();
  }
  sessions.set(cvId, session);
  return session;
}

export function updateCollabPresence(
  cvId: string,
  presence: CollabPresence
): CollabSessionState {
  const session = getCollabSession(cvId);
  const others = session.presence.filter(
    (p) => p.userId !== presence.userId && Date.now() - p.updatedAt < 60000
  );
  session.presence = [...others, { ...presence, updatedAt: Date.now() }];
  session.updatedAt = Date.now();
  sessions.set(cvId, session);
  return session;
}
