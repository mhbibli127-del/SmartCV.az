import type { CvEditorElement } from "@/types/cv-editor";
import type { TemplateFonts, TemplateTheme } from "@/templates/shared";
import { buildMinimalCorporate } from "@/templates/MinimalCorporate/build";
import { buildModernSplit } from "@/templates/ModernSplit/build";
import { buildExecutiveDark } from "@/templates/ExecutiveDark/build";
import { buildCreativePortfolio } from "@/templates/CreativePortfolio/build";
import { buildBrutalistBold } from "@/templates/BrutalistBold/build";
import { buildTimelineResume } from "@/templates/TimelineResume/build";
import { buildAppleMinimal } from "@/templates/AppleMinimal/build";
import { buildNeonCyber } from "@/templates/NeonCyber/build";
import { buildGlassmorphism } from "@/templates/Glassmorphism/build";
import { buildMagazineEditorial } from "@/templates/MagazineEditorial/build";
import { buildCanvaCreative } from "@/templates/CanvaCreative/build";
import { buildATSUltraProfessional } from "@/templates/ATSUltraProfessional/build";
import { buildSunsetGradient } from "@/templates/SunsetGradient/build";
import { buildSwissInternational } from "@/templates/SwissInternational/build";
import { buildArtDecoLuxe } from "@/templates/ArtDecoLuxe/build";

export type TemplateSlug =
  | "minimal-corporate"
  | "modern-split"
  | "executive-dark"
  | "creative-portfolio"
  | "brutalist-bold"
  | "timeline-resume"
  | "apple-minimal"
  | "neon-cyber"
  | "glassmorphism"
  | "magazine-editorial"
  | "canva-creative"
  | "ats-ultra-professional"
  | "sunset-gradient"
  | "swiss-international"
  | "art-deco-luxe";

export type TemplateBuilder = (
  theme: TemplateTheme,
  fonts: TemplateFonts
) => CvEditorElement[];

export interface TemplateRegistryEntry {
  slug: TemplateSlug;
  build: TemplateBuilder;
  canvasBackground: (theme: TemplateTheme) => string;
}

export const TEMPLATE_BUILDERS: Record<TemplateSlug, TemplateBuilder> = {
  "minimal-corporate": buildMinimalCorporate,
  "modern-split": buildModernSplit,
  "executive-dark": buildExecutiveDark,
  "creative-portfolio": buildCreativePortfolio,
  "brutalist-bold": buildBrutalistBold,
  "timeline-resume": buildTimelineResume,
  "apple-minimal": buildAppleMinimal,
  "neon-cyber": buildNeonCyber,
  glassmorphism: buildGlassmorphism,
  "magazine-editorial": buildMagazineEditorial,
  "canva-creative": buildCanvaCreative,
  "ats-ultra-professional": buildATSUltraProfessional,
  "sunset-gradient": buildSunsetGradient,
  "swiss-international": buildSwissInternational,
  "art-deco-luxe": buildArtDecoLuxe,
};

const BACKGROUNDS: Partial<Record<TemplateSlug, (t: TemplateTheme) => string>> = {
  "executive-dark": (t) => t.background,
  "sunset-gradient": (t) => t.surface ?? "#fff5f5",
  "art-deco-luxe": (t) => t.background,
  "neon-cyber": (t) =>
    t.background ||
    "linear-gradient(160deg, #0f0f23 0%, #1a0a2e 40%, #0d1b2a 100%)",
  glassmorphism: (t) =>
    t.background ||
    "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
};

export function buildTemplateElements(
  slug: TemplateSlug,
  theme: TemplateTheme,
  fonts: TemplateFonts
): CvEditorElement[] {
  const builder = TEMPLATE_BUILDERS[slug];
  if (!builder) return [];
  return builder(theme, fonts);
}

export function getTemplateCanvasBackground(slug: TemplateSlug, theme: TemplateTheme): string {
  const fn = BACKGROUNDS[slug];
  return fn ? fn(theme) : theme.background;
}

export function isKnownTemplateSlug(slug: string): slug is TemplateSlug {
  return slug in TEMPLATE_BUILDERS;
}
