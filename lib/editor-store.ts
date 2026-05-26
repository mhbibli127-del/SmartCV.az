import { create } from "zustand";
import type { EditorElement } from "@/types/cv-document";
import type { AlignmentGuide } from "@/lib/layout-engine";
import {
  autoSpacing,
  clampElement,
  createDefaultCanvas,
  nextZIndex,
  snapElementToGrid,
} from "@/lib/layout-engine";

const MAX_HISTORY = 50;

export type SidebarTab = "design" | "elements" | "layout" | "layers";

interface EditorStore {
  elements: EditorElement[];
  selectedId: string | null;
  past: EditorElement[][];
  future: EditorElement[][];
  isDirty: boolean;
  snapEnabled: boolean;
  alignmentGuides: AlignmentGuide[];
  sidebarTab: SidebarTab;
  editingId: string | null;

  loadElements: (elements: EditorElement[]) => void;
  toggleSnap: () => void;
  selectElement: (id: string | null) => void;
  setSidebarTab: (tab: SidebarTab) => void;
  setAlignmentGuides: (guides: AlignmentGuide[]) => void;
  clearAlignmentGuides: () => void;
  updateElement: (id: string, patch: Partial<EditorElement>, recordHistory?: boolean) => void;
  commitElementMove: (id: string, x: number, y: number) => void;
  resizeElement: (
    id: string,
    bounds: Pick<EditorElement, "x" | "y" | "width" | "height">
  ) => void;
  addTextElement: () => void;
  addSectionBlock: (sectionType: EditorElement["sectionType"]) => void;
  addShapeElement: (shapeType?: EditorElement["shapeType"]) => void;
  addImageElement: (src?: string) => void;
  addDividerElement: () => void;
  setEditingId: (id: string | null) => void;
  duplicateElement: (id: string) => void;
  toggleElementLock: (id: string) => void;
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

function applyPatch(
  state: EditorStore,
  id: string,
  patch: Partial<EditorElement>,
  recordHistory: boolean
) {
  const snap = state.snapEnabled ? snapElementToGrid : clampElement;
  const next = autoSpacing(
    state.elements.map((el) => (el.id === id ? snap({ ...el, ...patch }) : el))
  );
  return recordHistory ? pushHistory(state, next) : { ...state, elements: next, isDirty: true };
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  elements: createDefaultCanvas().elements,
  selectedId: null,
  past: [],
  future: [],
  isDirty: false,
  snapEnabled: true,
  alignmentGuides: [],
  sidebarTab: "elements",
  editingId: null,

  loadElements: (elements) =>
    set({ elements: autoSpacing(elements), past: [], future: [], isDirty: false, editingId: null }),

  setEditingId: (id) => set({ editingId: id }),

  toggleSnap: () => set((s) => ({ snapEnabled: !s.snapEnabled })),

  selectElement: (id) => set({ selectedId: id }),

  setSidebarTab: (tab) => set({ sidebarTab: tab }),

  setAlignmentGuides: (guides) => set({ alignmentGuides: guides }),

  clearAlignmentGuides: () => set({ alignmentGuides: [] }),

  updateElement: (id, patch, recordHistory = true) =>
    set((state) => applyPatch(state, id, patch, recordHistory)),

  commitElementMove: (id, x, y) => {
    get().clearAlignmentGuides();
    set((state) => applyPatch(state, id, { x, y }, true));
  },

  resizeElement: (id, bounds) =>
    set((state) => {
      const snap = state.snapEnabled ? snapElementToGrid : clampElement;
      const next = autoSpacing(
        state.elements.map((el) => (el.id === id ? snap({ ...el, ...bounds }) : el))
      );
      return { ...pushHistory(state, next), alignmentGuides: [] };
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

  addShapeElement: (shapeType = "rect") =>
    set((state) => {
      const el: EditorElement = {
        id: `shape-${Date.now()}`,
        type: "shape",
        x: 80,
        y: 80 + state.elements.length * 24,
        width: shapeType === "line" ? 200 : 120,
        height: shapeType === "line" ? 4 : 80,
        zIndex: nextZIndex(state.elements),
        shapeType,
        fill: "#6366f1",
        stroke: "#4f46e5",
        strokeWidth: 2,
        cornerRadius: shapeType === "circle" ? 999 : 8,
        opacity: 0.9,
      };
      return pushHistory(state, autoSpacing([...state.elements, el]));
    }),

  addImageElement: (src) =>
    set((state) => {
      const el: EditorElement = {
        id: `image-${Date.now()}`,
        type: "image",
        x: 80,
        y: 80 + state.elements.length * 24,
        width: 160,
        height: 120,
        zIndex: nextZIndex(state.elements),
        src: src ?? "",
        fill: "#e4e4e7",
      };
      return pushHistory(state, autoSpacing([...state.elements, el]));
    }),

  addDividerElement: () =>
    set((state) => {
      const el: EditorElement = {
        id: `divider-${Date.now()}`,
        type: "divider",
        x: 48,
        y: 100 + state.elements.length * 20,
        width: 698,
        height: 2,
        zIndex: nextZIndex(state.elements),
        fill: "#d4d4d8",
      };
      return pushHistory(state, autoSpacing([...state.elements, el]));
    }),

  duplicateElement: (id) =>
    set((state) => {
      const source = state.elements.find((e) => e.id === id);
      if (!source) return state;
      const copy: EditorElement = {
        ...source,
        id: `${source.type}-${Date.now()}`,
        x: source.x + 16,
        y: source.y + 16,
        zIndex: nextZIndex(state.elements),
      };
      return {
        ...pushHistory(state, autoSpacing([...state.elements, copy])),
        selectedId: copy.id,
      };
    }),

  toggleElementLock: (id) =>
    set((state) =>
      pushHistory(
        state,
        state.elements.map((e) => (e.id === id ? { ...e, locked: !e.locked } : e))
      )
    ),

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
        alignmentGuides: [],
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
        alignmentGuides: [],
      };
    }),

  resetCanvas: () =>
    set({
      elements: createDefaultCanvas().elements,
      selectedId: null,
      past: [],
      future: [],
      isDirty: true,
      alignmentGuides: [],
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
