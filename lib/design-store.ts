import { create } from "zustand";
import type { DesignTheme, TemplateMetadata, CopilotMessage } from "@/types/design-system";
import { DESIGN_THEMES } from "@/lib/design-engine/themes";
import { applyThemeToElements, computeLiveAtsScore } from "@/lib/design-engine/sync-engine";
import { useEditorStore } from "@/lib/editor-store";

import { getTemplateBySlug } from "@/lib/design-engine/template-catalog";

interface DesignStore {
  activeTheme: DesignTheme;
  selectedTemplate: TemplateMetadata | null;
  liveAtsScore: number;
  copilotOpen: boolean;
  copilotMessages: CopilotMessage[];
  copilotStreaming: boolean;

  setTheme: (theme: DesignTheme) => void;
  applyThemeToCanvas: () => void;
  setTemplate: (template: TemplateMetadata) => void;
  setPaletteAccent: (accent: string) => void;
  setFontPairing: (heading: string, body: string) => void;
  setSpacing: (spacing: number) => void;
  toggleCopilot: () => void;
  addCopilotMessage: (msg: Omit<CopilotMessage, "id" | "timestamp">) => void;
  setCopilotStreaming: (v: boolean) => void;
  refreshLiveScores: () => void;
  hydrateDesign: (persisted: { theme: DesignTheme; templateSlug?: string }) => void;
}

export const useDesignStore = create<DesignStore>((set, get) => ({
  activeTheme: DESIGN_THEMES[0]!,
  selectedTemplate: null,
  liveAtsScore: DESIGN_THEMES[0]!.atsScore,
  copilotOpen: false,
  copilotMessages: [
    {
      id: "welcome",
      role: "assistant",
      content:
        "I'm your AI design copilot. I can redesign sections, optimize ATS, suggest colors, and improve hierarchy — all in realtime.",
      timestamp: Date.now(),
    },
  ],
  copilotStreaming: false,

  setTheme: (theme) => {
    set({ activeTheme: theme });
    get().applyThemeToCanvas();
  },

  applyThemeToCanvas: () => {
    const theme = get().activeTheme;
    const editor = useEditorStore.getState();
    const next = applyThemeToElements(editor.elements, theme);
    editor.loadElements(next);
    set({ liveAtsScore: computeLiveAtsScore(theme, next.length) });
  },

  setTemplate: (template) => {
    set({ selectedTemplate: template, activeTheme: template.theme });
    get().applyThemeToCanvas();
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

  toggleCopilot: () => set((s) => ({ copilotOpen: !s.copilotOpen })),

  addCopilotMessage: (msg) =>
    set((s) => ({
      copilotMessages: [
        ...s.copilotMessages,
        { ...msg, id: `msg-${Date.now()}`, timestamp: Date.now() },
      ].slice(-50),
    })),

  setCopilotStreaming: (v) => set({ copilotStreaming: v }),

  refreshLiveScores: () => {
    const { activeTheme } = get();
    const count = useEditorStore.getState().elements.length;
    set({ liveAtsScore: computeLiveAtsScore(activeTheme, count) });
  },

  hydrateDesign: (persisted) => {
    set({ activeTheme: persisted.theme });
    if (persisted.templateSlug) {
      const tpl = getTemplateBySlug(persisted.templateSlug);
      if (tpl) set({ selectedTemplate: tpl, activeTheme: persisted.theme });
    }
    get().applyThemeToCanvas();
  },
}));
