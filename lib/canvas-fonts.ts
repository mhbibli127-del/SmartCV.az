import type { EditorElement } from "@/types/cv-document";
import { collectCanvasFontFamilies } from "@/lib/cv-text-style";
import { loadFontOption, resolveFontFromCss } from "@/lib/studio-fonts";

/** Load Google fonts referenced by canvas elements (Konva uses document.fonts). */
export async function ensureCanvasFontsLoaded(elements: EditorElement[]): Promise<void> {
  if (typeof document === "undefined") return;

  for (const family of collectCanvasFontFamilies(elements)) {
    const option = resolveFontFromCss(family.split(",")[0]?.trim() ?? family);
    if (option) loadFontOption(option);
  }

  try {
    await document.fonts.ready;
  } catch {
    /* ignore */
  }
}
