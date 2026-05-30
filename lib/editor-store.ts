import { create } from "zustand";
import type { EditorElement } from "@/types/cv-document";
import type { AlignmentGuide } from "@/lib/layout-engine";
import {
  createDefaultCanvas,
  nextZIndex,
  snapElementToGrid,
  CANVAS_PADDING,
  SECTION_GAP,
} from "@/lib/layout-engine";
import {
  applyLayoutPipeline,
  clampForLayoutMode,
  type CanvasLayoutMode,
} from "@/lib/canvas-layout";
import { getOverflowElements, repositionForPage } from "@/lib/page-overflow";
import {
  alignElementX,
  alignElementY,
  type HorizontalAlign,
  type VerticalAlign,
} from "@/lib/studio-align";

const MAX_HISTORY = 30;
let elementClipboard: EditorElement | null = null;

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
  pageCount: number;
  activePage: number;
  showRulers: boolean;
  showGrid: boolean;
  isExporting: boolean;
  renderVersion: number;
  activeTemplateSlug: string | null;
  layoutMode: CanvasLayoutMode;
  canvasBackground: string;

  loadElements: (
    elements: EditorElement[],
    opts?: { background?: string; keepDirty?: boolean }
  ) => void;
  setCanvasBackground: (background: string) => void;
  replaceCanvasForTemplate: (elements: EditorElement[]) => void;
  hydrateTemplateCanvas: (elements: EditorElement[], templateSlug: string) => number;
  resetEditorState: () => void;
  clearInteractionState: () => void;
  setElementsInPlace: (elements: EditorElement[]) => void;
  setExporting: (value: boolean) => void;
  moveOverflowToNextPage: () => void;
  setActivePage: (page: number) => void;
  addPage: () => void;
  toggleRulers: () => void;
  toggleShowGrid: () => void;
  toggleSnap: () => void;
  copyElement: (id: string) => void;
  pasteElement: () => void;
  alignSelectedHorizontally: (mode: HorizontalAlign) => void;
  alignSelectedVertically: (mode: VerticalAlign) => void;
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
  addTextElement: (preset?: Partial<EditorElement>) => void;
  addSectionBlock: (sectionType: EditorElement["sectionType"], defaultContent?: string) => void;
  addShapeElement: (shapeType?: EditorElement["shapeType"]) => void;
  addImageElement: (src?: string) => void;
  addDividerElement: () => void;
  setEditingId: (id: string | null) => void;
  duplicateElement: (id: string) => void;
  toggleElementLock: (id: string) => void;
  removeElement: (id: string) => void;
  reorderElements: (orderedIds: string[]) => void;
  /** Layer list order: front (top) → back (bottom). */
  reorderLayers: (orderedIdsFrontToBack: string[]) => void;
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

function layoutElements(
  state: EditorStore,
  elements: EditorElement[]
): EditorElement[] {
  return applyLayoutPipeline(elements, state.layoutMode);
}

function applyPatch(
  state: EditorStore,
  id: string,
  patch: Partial<EditorElement>,
  recordHistory: boolean
) {
  const clamp = (el: EditorElement) =>
    state.snapEnabled && state.layoutMode === "flow"
      ? snapElementToGrid(el)
      : clampForLayoutMode(el, state.layoutMode);
  const next = layoutElements(
    state,
    state.elements.map((el) => (el.id === id ? clamp({ ...el, ...patch }) : el))
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
  pageCount: 1,
  activePage: 1,
  showRulers: false,
  showGrid: false,
  isExporting: false,
  renderVersion: 0,
  activeTemplateSlug: null,
  layoutMode: "flow",
  canvasBackground: "#ffffff",

  resetEditorState: () =>
    set((state) => ({
      elements: [],
      selectedId: null,
      editingId: null,
      alignmentGuides: [],
      past: [],
      future: [],
      isDirty: false,
      isExporting: false,
      pageCount: 1,
      activePage: 1,
      activeTemplateSlug: null,
      layoutMode: "flow",
      canvasBackground: "#ffffff",
      renderVersion: state.renderVersion + 1,
    })),

  hydrateTemplateCanvas: (elements, templateSlug) => {
    const maxPage = Math.max(1, ...elements.map((e) => e.page ?? 1));
    let nextVersion = 0;
    set((state) => {
      nextVersion = state.renderVersion + 1;
      return {
        elements: applyLayoutPipeline(
          elements.map((e) => ({ ...e })),
          "absolute"
        ),
        selectedId: null,
        editingId: null,
        alignmentGuides: [],
        past: [],
        future: [],
        isDirty: true,
        isExporting: false,
        pageCount: maxPage,
        activePage: 1,
        activeTemplateSlug: templateSlug,
        layoutMode: "absolute",
        renderVersion: nextVersion,
      };
    });
    return nextVersion;
  },

  loadElements: (elements, opts) => {
    const maxPage = Math.max(1, ...elements.map((e) => e.page ?? 1));
    const mode: CanvasLayoutMode = elements.some(
      (e) => e.id === "template-base" || e.x === 0
    )
      ? "absolute"
      : "flow";
    set((state) => ({
      elements: applyLayoutPipeline(elements.map((e) => ({ ...e })), mode),
      selectedId: null,
      editingId: null,
      alignmentGuides: [],
      past: [],
      future: [],
      isDirty: opts?.keepDirty ? state.isDirty : false,
      isExporting: false,
      pageCount: maxPage,
      activePage: 1,
      layoutMode: mode,
      canvasBackground: opts?.background ?? state.canvasBackground,
    }));
  },

  setCanvasBackground: (background) =>
    set({ canvasBackground: background, isDirty: true }),

  replaceCanvasForTemplate: (elements) => {
    const maxPage = Math.max(1, ...elements.map((e) => e.page ?? 1));
    set({
      elements: applyLayoutPipeline(elements.map((e) => ({ ...e })), "absolute"),
      selectedId: null,
      editingId: null,
      alignmentGuides: [],
      past: [],
      future: [],
      isDirty: true,
      isExporting: false,
      pageCount: maxPage,
      activePage: 1,
      layoutMode: "absolute",
    });
  },

  clearInteractionState: () =>
    set({
      selectedId: null,
      editingId: null,
      alignmentGuides: [],
      isExporting: false,
    }),

  setElementsInPlace: (elements) =>
    set((state) => ({
      elements: layoutElements(state, elements.map((e) => ({ ...e }))),
      isDirty: true,
    })),

  setActivePage: (page) =>
    set((s) => ({
      activePage: Math.min(Math.max(1, page), s.pageCount),
      selectedId: null,
      editingId: null,
    })),

  addPage: () =>
    set((s) => ({
      pageCount: s.pageCount + 1,
      activePage: s.pageCount + 1,
      isDirty: true,
    })),

  toggleRulers: () => set((s) => ({ showRulers: !s.showRulers })),

  toggleShowGrid: () => set((s) => ({ showGrid: !s.showGrid })),

  copyElement: (id) => {
    const el = get().elements.find((e) => e.id === id);
    if (el) elementClipboard = snapshot([el])[0];
  },

  pasteElement: () => {
    if (!elementClipboard) return;
    set((state) => {
      const copy: EditorElement = {
        ...elementClipboard!,
        id: `${elementClipboard!.type}-${Date.now()}`,
        x: elementClipboard!.x + 16,
        y: elementClipboard!.y + 16,
        zIndex: nextZIndex(state.elements),
        page: state.activePage,
      };
      return {
        ...pushHistory(state, layoutElements(state, [...state.elements, copy])),
        selectedId: copy.id,
      };
    });
  },

  alignSelectedHorizontally: (mode) => {
    const state = get();
    const el = state.elements.find((e) => e.id === state.selectedId);
    if (!el || el.locked) return;
    const x = alignElementX(el, mode, state.layoutMode);
    set((s) => applyPatch(s, el.id, { x }, true));
  },

  alignSelectedVertically: (mode) => {
    const state = get();
    const el = state.elements.find((e) => e.id === state.selectedId);
    if (!el || el.locked) return;
    const y = alignElementY(el, mode, state.layoutMode);
    set((s) => applyPatch(s, el.id, { y }, true));
  },

  setExporting: (value) =>
    set((s) => ({
      isExporting: value,
      ...(value ? { selectedId: null, editingId: null } : {}),
    })),

  moveOverflowToNextPage: () =>
    set((state) => {
      const overflow = getOverflowElements(state.elements, state.activePage);
      if (overflow.length === 0) return state;

      let pageCount = state.pageCount;
      const targetPage = state.activePage + 1;
      if (targetPage > pageCount) pageCount = targetPage;

      const overflowIds = new Set(overflow.map((e) => e.id));
      let y = CANVAS_PADDING;
      const moved = [...overflow]
        .sort((a, b) => a.y - b.y)
        .map((el) => {
          const next = { ...el, page: targetPage, y };
          y += el.height + SECTION_GAP;
          return next;
        });

      const kept = state.elements.filter((e) => !overflowIds.has(e.id));
      const merged = layoutElements(
        state,
        repositionForPage([...kept, ...moved], targetPage)
      );

      return {
        ...pushHistory(state, merged),
        pageCount,
        activePage: targetPage,
      };
    }),

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
    set((state) => {
      const clamp = (el: EditorElement) =>
        state.snapEnabled && state.layoutMode === "flow"
          ? snapElementToGrid(el)
          : clampForLayoutMode(el, state.layoutMode);
      const patched = state.elements.map((el) =>
        el.id === id ? clamp({ ...el, x, y }) : el
      );
      const next =
        state.layoutMode === "flow"
          ? layoutElements(state, patched)
          : patched;
      return pushHistory(state, next);
    });
  },

  resizeElement: (id, bounds) =>
    set((state) => {
      const clamp = (el: EditorElement) =>
        state.snapEnabled && state.layoutMode === "flow"
          ? snapElementToGrid(el)
          : clampForLayoutMode(el, state.layoutMode);
      const patched = state.elements.map((el) =>
        el.id === id ? clamp({ ...el, ...bounds }) : el
      );
      const next =
        state.layoutMode === "flow"
          ? layoutElements(state, patched)
          : patched;
      return { ...pushHistory(state, next), alignmentGuides: [] };
    }),

  addTextElement: (preset) =>
    set((state) => {
      const el: EditorElement = {
        id: `text-${Date.now()}`,
        type: "text",
        x: 48,
        y: 48 + state.elements.length * 32,
        width: preset?.width ?? 300,
        height: preset?.height ?? 28,
        zIndex: nextZIndex(state.elements),
        text: preset?.text ?? "Click to edit",
        fontSize: preset?.fontSize ?? 13,
        fill: preset?.fill ?? "#18181b",
        fontFamily: preset?.fontFamily,
        fontWeight: preset?.fontWeight,
        fontStyle: preset?.fontStyle,
        lineHeight: preset?.lineHeight,
        letterSpacing: preset?.letterSpacing,
        textAlign: preset?.textAlign,
        page: state.activePage,
      };
      return {
        ...pushHistory(state, layoutElements(state, [...state.elements, el])),
        selectedId: el.id,
      };
    }),

  addSectionBlock: (sectionType, defaultContent) =>
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
        content: defaultContent ?? "Click to edit",
        fontSize: 12,
        fill: "#3f3f46",
        page: state.activePage,
      };
      return pushHistory(state, layoutElements(state, [...state.elements, el]));
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
        page: state.activePage,
      };
      return pushHistory(state, layoutElements(state, [...state.elements, el]));
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
        page: state.activePage,
      };
      return pushHistory(state, layoutElements(state, [...state.elements, el]));
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
        page: state.activePage,
      };
      return pushHistory(state, layoutElements(state, [...state.elements, el]));
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
        ...pushHistory(state, layoutElements(state, [...state.elements, copy])),
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

  reorderElements: (orderedIds) =>
    set((state) => {
      const byId = new Map(state.elements.map((e) => [e.id, e]));
      const ordered = orderedIds
        .map((id) => byId.get(id))
        .filter((e): e is EditorElement => Boolean(e));
      const missing = state.elements.filter((e) => !orderedIds.includes(e.id));
      const fullOrder = [...ordered, ...missing];
      if (fullOrder.length === 0) return state;

      const next =
        state.layoutMode === "absolute"
          ? fullOrder.map((el, index) => ({ ...el, zIndex: index + 1 }))
          : (() => {
              let y = CANVAS_PADDING;
              return fullOrder.map((el) => {
                const repositioned = { ...el, y };
                y += el.height + SECTION_GAP;
                return repositioned;
              });
            })();

      return pushHistory(state, layoutElements(state, next));
    }),

  reorderLayers: (orderedIdsFrontToBack) =>
    set((state) => {
      const page = state.activePage;
      const pageIds = new Set(
        state.elements.filter((e) => (e.page ?? 1) === page).map((e) => e.id)
      );
      const n = orderedIdsFrontToBack.length;
      if (n === 0) return state;
      const next = state.elements.map((el) => {
        if (!pageIds.has(el.id)) return el;
        const idx = orderedIdsFrontToBack.indexOf(el.id);
        if (idx < 0) return el;
        return { ...el, zIndex: n - idx };
      });
      return pushHistory(state, next);
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
      editingId: null,
      past: [],
      future: [],
      isDirty: true,
      alignmentGuides: [],
      isExporting: false,
      activePage: 1,
      pageCount: 1,
    }),

  markSaved: () => set({ isDirty: false }),

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
}));

export function getCanvasStateFromStore() {
  const { elements, pageCount, canvasBackground } = useEditorStore.getState();
  return {
    width: 794,
    height: 1123,
    background: canvasBackground,
    elements,
    pageCount,
  };
}
