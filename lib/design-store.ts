import { create } from "zustand";
import type { DesignTheme, TemplateMetadata } from "@/types/design-system";
import { DESIGN_THEMES } from "@/lib/design-engine/themes";
import { applyThemeToElements, computeLiveAtsScore } from "@/lib/design-engine/sync-engine";
import { useEditorStore } from "@/lib/editor-store";

import { getTemplateBySlug } from "@/lib/design-engine/template-catalog";

interface DesignStore {
  activeTheme: DesignTheme;
  selectedTemplate: TemplateMetadata | null;
  liveAtsScore: number;

  setTheme: (theme: DesignTheme) => void;
  applyThemeToCanvas: () => void;
  setTemplate: (template: TemplateMetadata) => void;
  setTemplateMeta: (template: TemplateMetadata) => void;
  setPaletteAccent: (accent: string) => void;
  setFontPairing: (heading: string, body: string) => void;
  setSpacing: (spacing: number) => void;
  refreshLiveScores: () => void;
  hydrateDesign: (persisted: { theme: DesignTheme; templateSlug?: string }) => void;
  resetTemplateSession: () => void;
  atsSafeMode: boolean;
  toggleAtsSafeMode: () => void;
}

export const useDesignStore = create<DesignStore>((set, get) => ({
  activeTheme: DESIGN_THEMES[0]!,
  selectedTemplate: null,
  liveAtsScore: DESIGN_THEMES[0]!.atsScore,
  atsSafeMode: false,

  setTheme: (theme) => {
    set({ activeTheme: theme });
    get().applyThemeToCanvas();
  },

  applyThemeToCanvas: () => {
    const theme = get().activeTheme;
    const editor = useEditorStore.getState();
    const preserveTemplateColors =
      editor.layoutMode === "absolute" && Boolean(editor.activeTemplateSlug);
    const next = applyThemeToElements(editor.elements, theme, {
      preserveTemplateColors,
    });
    editor.setElementsInPlace(next);
    set({ liveAtsScore: computeLiveAtsScore(theme, next.length) });
  },

  setTemplateMeta: (template) => {
    const count = useEditorStore.getState().elements.length;
    set({
      selectedTemplate: template,
      activeTheme: template.theme,
      liveAtsScore: computeLiveAtsScore(template.theme, count),
    });
  },

  setTemplate: (template) => {
    get().setTemplateMeta(template);
  },

  resetTemplateSession: () => {
    set({
      selectedTemplate: null,
      atsSafeMode: false,
    });
  },

  setPaletteAccent: (accent) => {
    const theme = get().activeTheme;
    const updated: DesignTheme = {
      ...theme,
      palette: { ...theme.palette, accent },
    };
    set({ activeTheme: updated });
    get().applyThemeToCanvas();
  },

  setFontPairing: (heading, body) => {
    const theme = get().activeTheme;
    set({
      activeTheme: {
        ...theme,
        fonts: { ...theme.fonts, heading, body, label: `${heading} / ${body}` },
      },
    });
    get().applyThemeToCanvas();
  },

  setSpacing: (spacing) => {
    const theme = get().activeTheme;
    set({ activeTheme: { ...theme, spacing } });
    get().applyThemeToCanvas();
  },

  refreshLiveScores: () => {
    const { activeTheme } = get();
    const count = useEditorStore.getState().elements.length;
    set({ liveAtsScore: computeLiveAtsScore(activeTheme, count) });
  },

  hydrateDesign: (persisted) => {
    const template = persisted.templateSlug
      ? getTemplateBySlug(persisted.templateSlug)
      : null;
    set({
      activeTheme: persisted.theme,
      selectedTemplate: template ?? null,
      liveAtsScore: computeLiveAtsScore(
        persisted.theme,
        useEditorStore.getState().elements.length
      ),
    });
  },

  toggleAtsSafeMode: () => set((s) => ({ atsSafeMode: !s.atsSafeMode })),
}));
