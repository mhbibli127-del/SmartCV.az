import { create } from "zustand";
import type {
  CvEditorElement,
  CvEditorTemplate,
  LeftSidebarSection,
  SaveStatus,
} from "@/types/cv-editor";
import { A4_HEIGHT, A4_WIDTH } from "@/lib/layout-engine";
import {
  buildElementsFromTemplate,
  canvasBackground,
} from "@/lib/cv-editor/template-catalog";
import { extractResumeData } from "@/lib/cv-editor/resume-data";

const MAX_HISTORY = 40;

interface CvEditorState {
  elements: CvEditorElement[];
  selectedId: string | null;
  editingId: string | null;
  template: CvEditorTemplate | null;
  cvId: string | null;
  title: string;
  zoom: number;
  darkMode: boolean;
  background: string;
  past: CvEditorElement[][];
  future: CvEditorElement[][];
  saveStatus: SaveStatus;
  lastSavedAt: string | null;
  activeSection: LeftSidebarSection;

  loadTemplate: (template: CvEditorTemplate) => void;
  switchTemplate: (template: CvEditorTemplate) => void;
  resetForNewTemplate: (template: CvEditorTemplate) => void;
  loadDocument: (payload: {
    elements: CvEditorElement[];
    template?: CvEditorTemplate | null;
    cvId?: string | null;
    title?: string;
    background?: string;
  }) => void;
  selectElement: (id: string | null) => void;
  setEditingId: (id: string | null) => void;
  setActiveSection: (section: LeftSidebarSection) => void;
  updateElement: (id: string, patch: Partial<CvEditorElement>, record?: boolean) => void;
  moveElement: (id: string, x: number, y: number) => void;
  resizeElement: (id: string, bounds: Pick<CvEditorElement, "x" | "y" | "width" | "height">) => void;
  addTextElement: (content?: string) => void;
  addSectionBlock: (label: string, content?: string) => void;
  addImageElement: (src: string) => void;
  duplicateElement: (id: string) => void;
  toggleLock: (id: string) => void;
  removeElement: (id: string) => void;
  applyTemplateColors: (colors: CvEditorTemplate["colors"]) => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitScreen: () => void;
  toggleDarkMode: () => void;
  setSaveStatus: (status: SaveStatus, savedAt?: string) => void;
  setCvId: (id: string | null) => void;
  setTitle: (title: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

function snapshot(elements: CvEditorElement[]) {
  return elements.map((e) => ({ ...e, style: { ...e.style } }));
}

function pushHistory(state: CvEditorState, next: CvEditorElement[]) {
  return {
    elements: next,
    past: [...state.past, snapshot(state.elements)].slice(-MAX_HISTORY),
    future: [],
  };
}

function nextId() {
  return `el-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export const useCvEditorStore = create<CvEditorState>((set, get) => ({
  elements: [],
  selectedId: null,
  editingId: null,
  template: null,
  cvId: null,
  title: "Untitled CV",
  zoom: 0.85,
  darkMode: false,
  background: "#ffffff",
  past: [],
  future: [],
  saveStatus: "idle",
  lastSavedAt: null,
  activeSection: "text",

  loadTemplate: (template) => {
    const elements = buildElementsFromTemplate(template);
    set({
      template,
      elements,
      background: canvasBackground(template),
      selectedId: null,
      editingId: null,
      past: [],
      future: [],
      saveStatus: "idle",
    });
  },

  switchTemplate: (template) => {
    const state = get();
    const resumeData = extractResumeData(state.elements);
    const elements = buildElementsFromTemplate(template, resumeData);
    set({
      template,
      elements,
      background: canvasBackground(template),
      selectedId: null,
      editingId: null,
      past: [],
      future: [],
      saveStatus: "idle",
    });
  },

  resetForNewTemplate: (template) => {
    const elements = buildElementsFromTemplate(template);
    set({
      template,
      elements,
      background: canvasBackground(template),
      cvId: null,
      title: `${template.name} CV`,
      selectedId: null,
      editingId: null,
      past: [],
      future: [],
      saveStatus: "idle",
    });
  },

  loadDocument: ({ elements, template, cvId, title, background }) =>
    set({
      elements,
      template: template ?? null,
      cvId: cvId ?? null,
      title: title ?? "Untitled CV",
      background: background ?? "#ffffff",
      past: [],
      future: [],
      selectedId: null,
      editingId: null,
    }),

  selectElement: (id) => set({ selectedId: id }),
  setEditingId: (id) => set({ editingId: id }),
  setActiveSection: (section) => set({ activeSection: section }),

  updateElement: (id, patch, record = true) =>
    set((state) => {
      const next = state.elements.map((el) =>
        el.id === id
          ? {
              ...el,
              ...patch,
              style: patch.style ? { ...el.style, ...patch.style } : el.style,
            }
          : el
      );
      return record ? pushHistory(state, next) : { elements: next };
    }),

  moveElement: (id, x, y) => {
    const el = get().elements.find((e) => e.id === id);
    if (!el || el.locked) return;
    get().updateElement(id, { x, y });
  },

  resizeElement: (id, bounds) => get().updateElement(id, bounds),

  addTextElement: (content = "New text") =>
    set((state) => {
      const maxZ = Math.max(0, ...state.elements.map((e) => e.zIndex));
      const element: CvEditorElement = {
        id: nextId(),
        type: "text",
        x: 80,
        y: 80,
        width: 280,
        height: 40,
        rotation: 0,
        content,
        zIndex: maxZ + 1,
        style: {
          fontSize: 14,
          color: state.template?.colors.text ?? "#18181b",
          fontFamily: state.template?.fonts.body ?? "Inter",
        },
      };
      return { ...pushHistory(state, [...state.elements, element]), selectedId: element.id };
    }),

  addSectionBlock: (label, content = "Add your content here…") =>
    set((state) => {
      const maxZ = Math.max(0, ...state.elements.map((e) => e.zIndex));
      const y = 120 + state.elements.length * 12;
      const block: CvEditorElement = {
        id: nextId(),
        type: "section",
        x: 48,
        y,
        width: A4_WIDTH - 96,
        height: 100,
        rotation: 0,
        content: `${label}\n\n${content}`,
        sectionType: label.toLowerCase(),
        zIndex: maxZ + 1,
        style: {
          fontSize: 12,
          color: state.template?.colors.text ?? "#18181b",
          fontFamily: state.template?.fonts.body ?? "Inter",
          background: state.template?.colors.background ?? "#fafafa",
          borderRadius: 8,
          padding: 12,
        },
      };
      return { ...pushHistory(state, [...state.elements, block]), selectedId: block.id };
    }),

  addImageElement: (src) =>
    set((state) => {
      const maxZ = Math.max(0, ...state.elements.map((e) => e.zIndex));
      const img: CvEditorElement = {
        id: nextId(),
        type: "image",
        x: 100,
        y: 100,
        width: 140,
        height: 140,
        rotation: 0,
        content: "",
        src,
        zIndex: maxZ + 1,
        style: { borderRadius: 8 },
      };
      return { ...pushHistory(state, [...state.elements, img]), selectedId: img.id };
    }),

  duplicateElement: (id) =>
    set((state) => {
      const source = state.elements.find((e) => e.id === id);
      if (!source) return state;
      const copy: CvEditorElement = {
        ...source,
        id: nextId(),
        x: source.x + 16,
        y: source.y + 16,
        style: { ...source.style },
        zIndex: source.zIndex + 1,
      };
      return pushHistory(state, [...state.elements, copy]);
    }),

  toggleLock: (id) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, locked: !el.locked } : el
      ),
    })),

  removeElement: (id) =>
    set((state) => ({
      ...pushHistory(
        state,
        state.elements.filter((el) => el.id !== id)
      ),
      selectedId: state.selectedId === id ? null : state.selectedId,
    })),

  applyTemplateColors: (colors) =>
    set((state) => ({
      background: colors.background,
      elements: state.elements.map((el) => ({
        ...el,
        style: {
          ...el.style,
          color:
            el.type === "text" && el.style.color === state.template?.colors.text
              ? colors.text
              : el.style.color,
        },
      })),
      template: state.template
        ? { ...state.template, colors: { ...state.template.colors, ...colors } }
        : null,
    })),

  setZoom: (zoom) => set({ zoom: Math.min(2, Math.max(0.35, zoom)) }),
  zoomIn: () => set((s) => ({ zoom: Math.min(2, s.zoom + 0.1) })),
  zoomOut: () => set((s) => ({ zoom: Math.max(0.35, s.zoom - 0.1) })),
  fitScreen: () => set({ zoom: 0.85 }),
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

  setSaveStatus: (status, savedAt) =>
    set({ saveStatus: status, lastSavedAt: savedAt ?? get().lastSavedAt }),

  setCvId: (id) => set({ cvId: id }),
  setTitle: (title) => set({ title }),

  undo: () =>
    set((state) => {
      if (!state.past.length) return state;
      const previous = state.past[state.past.length - 1];
      return {
        elements: previous,
        past: state.past.slice(0, -1),
        future: [snapshot(state.elements), ...state.future].slice(0, MAX_HISTORY),
      };
    }),

  redo: () =>
    set((state) => {
      if (!state.future.length) return state;
      const next = state.future[0];
      return {
        elements: next,
        past: [...state.past, snapshot(state.elements)].slice(-MAX_HISTORY),
        future: state.future.slice(1),
      };
    }),

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
}));

export { A4_WIDTH, A4_HEIGHT };
