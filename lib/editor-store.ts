import { create } from "zustand";
import type { EditorElement } from "@/types/cv-document";
import {
  autoSpacing,
  clampElement,
  createDefaultCanvas,
  nextZIndex,
  snapElementToGrid,
} from "@/lib/layout-engine";

const MAX_HISTORY = 50;

interface EditorStore {
  elements: EditorElement[];
  selectedId: string | null;
  past: EditorElement[][];
  future: EditorElement[][];
  isDirty: boolean;
  snapEnabled: boolean;

  loadElements: (elements: EditorElement[]) => void;
  toggleSnap: () => void;
  selectElement: (id: string | null) => void;
  updateElement: (id: string, patch: Partial<EditorElement>) => void;
  addTextElement: () => void;
  addSectionBlock: (sectionType: EditorElement["sectionType"]) => void;
  removeElement: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  undo: () => void;
  redo: () => void;
  resetCanvas: () => void;
  markSaved: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

function snapshot(elements: EditorElement[]): EditorElement[] {
  return elements.map((e) => ({ ...e }));
}

function pushHistory(state: EditorStore, nextElements: EditorElement[]) {
  const past = [...state.past, snapshot(state.elements)].slice(-MAX_HISTORY);
  return { elements: nextElements, past, future: [], isDirty: true };
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  elements: createDefaultCanvas().elements,
  selectedId: null,
  past: [],
  future: [],
  isDirty: false,
  snapEnabled: true,

  loadElements: (elements) =>
    set({ elements: autoSpacing(elements), past: [], future: [], isDirty: false }),

  toggleSnap: () => set((s) => ({ snapEnabled: !s.snapEnabled })),

  selectElement: (id) => set({ selectedId: id }),

  updateElement: (id, patch) =>
    set((state) => {
      const snap = state.snapEnabled ? snapElementToGrid : clampElement;
      const next = autoSpacing(
        state.elements.map((el) =>
          el.id === id ? snap({ ...el, ...patch }) : el
        )
      );
      return pushHistory(state, next);
    }),

  addTextElement: () =>
    set((state) => {
      const el: EditorElement = {
        id: `text-${Date.now()}`,
        type: "text",
        x: 48,
        y: 48 + state.elements.length * 32,
        width: 300,
        height: 28,
        zIndex: nextZIndex(state.elements),
        text: "New text block",
        fontSize: 13,
        fill: "#18181b",
      };
      return pushHistory(state, autoSpacing([...state.elements, el]));
    }),

  addSectionBlock: (sectionType) =>
    set((state) => {
      const el: EditorElement = {
        id: `section-${Date.now()}`,
        type: "section",
        x: 48,
        y: 120 + state.elements.length * 40,
        width: 698,
        height: 80,
        zIndex: nextZIndex(state.elements),
        sectionType: sectionType ?? "experience",
        content: "Section content…",
        fontSize: 12,
        fill: "#3f3f46",
      };
      return pushHistory(state, autoSpacing([...state.elements, el]));
    }),

  removeElement: (id) =>
    set((state) => {
      const next = state.elements.filter((e) => e.id !== id);
      return {
        ...pushHistory(state, next),
        selectedId: state.selectedId === id ? null : state.selectedId,
      };
    }),

  bringForward: (id) =>
    set((state) => {
      const maxZ = Math.max(...state.elements.map((e) => e.zIndex));
      const next = state.elements.map((e) =>
        e.id === id ? { ...e, zIndex: maxZ + 1 } : e
      );
      return pushHistory(state, next);
    }),

  sendBackward: (id) =>
    set((state) => {
      const minZ = Math.min(...state.elements.map((e) => e.zIndex));
      const next = state.elements.map((e) =>
        e.id === id ? { ...e, zIndex: Math.max(1, minZ - 1) } : e
      );
      return pushHistory(state, next);
    }),

  undo: () =>
    set((state) => {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        elements: previous,
        past: state.past.slice(0, -1),
        future: [snapshot(state.elements), ...state.future].slice(0, MAX_HISTORY),
        isDirty: true,
      };
    }),

  redo: () =>
    set((state) => {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        elements: next,
        past: [...state.past, snapshot(state.elements)].slice(-MAX_HISTORY),
        future: state.future.slice(1),
        isDirty: true,
      };
    }),

  resetCanvas: () =>
    set({
      elements: createDefaultCanvas().elements,
      selectedId: null,
      past: [],
      future: [],
      isDirty: true,
    }),

  markSaved: () => set({ isDirty: false }),

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
}));

export function getCanvasStateFromStore() {
  const { elements } = useEditorStore.getState();
  return {
    width: 794,
    height: 1123,
    background: "#ffffff",
    elements,
  };
}
