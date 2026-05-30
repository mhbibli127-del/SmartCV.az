import type { EditorElement } from "@/types/cv-document";
import type { DesignTheme } from "@/types/design-system";

/**
 * Interconnected design sync — theme changes propagate to all canvas elements.
 * Typography scale adjusts with density; colors map by element role.
 * Layout coordinates are never mutated here — editor store handles layout pipeline.
 */
export function applyThemeToElements(
  elements: EditorElement[],
  theme: DesignTheme,
  options?: { preserveTemplateColors?: boolean }
): EditorElement[] {
  const { palette, fonts, density } = theme;
  const scale = density === "compact" ? 0.92 : density === "spacious" ? 1.08 : 1;
  const preserveColors = options?.preserveTemplateColors ?? false;

  return elements.map((el) => {
    const base: EditorElement = { ...el };

    if (preserveColors) {
      if (el.fontSize) base.fontSize = Math.round(el.fontSize * scale);
      return base;
    }

    if (el.id === "heading-name" || (el.type === "text" && el.fontWeight === "bold")) {
      base.fill = palette.primary;
      base.fontFamily = fonts.heading;
      base.fontSize = Math.round((el.fontSize ?? 28) * scale);
    } else if (el.id === "heading-title" || el.id === "heading-contact") {
      base.fill = palette.textMuted;
      base.fontFamily = fonts.body;
      base.fontSize = Math.round((el.fontSize ?? 14) * scale);
    } else if (el.type === "section") {
      base.fill = palette.text;
      base.fontFamily = fonts.body;
      base.fontSize = Math.round((el.fontSize ?? 12) * scale);
    } else if (el.type === "text") {
      base.fill = palette.text;
      base.fontFamily = fonts.body;
      if (el.fontSize) base.fontSize = Math.round(el.fontSize * scale);
    }

    return base;
  });
}

export function themeToCanvasBackground(theme: DesignTheme): string {
  return theme.palette.background.startsWith("rgba")
    ? "#ffffff"
    : theme.palette.background;
}

export function computeLiveAtsScore(theme: DesignTheme, elementCount: number): number {
  let score = theme.atsScore;
  if (elementCount > 24) score -= 8;
  if (theme.effects.animatedGradient) score -= 5;
  if (theme.aesthetic === "faang" || theme.aesthetic === "minimal") score += 3;
  return Math.min(100, Math.max(0, score));
}
