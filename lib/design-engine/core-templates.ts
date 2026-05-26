import type { TemplateMetadata } from "@/types/design-system";
import { DESIGN_THEMES } from "@/lib/design-engine/themes";

export type CoreTemplateCategory = "Professional" | "Modern" | "Creative" | "Executive";

const CATEGORY_MAP: Record<string, CoreTemplateCategory> = {
  minimal: "Professional",
  corporate: "Professional",
  faang: "Professional",
  startup: "Modern",
  glass: "Modern",
  cyber: "Modern",
  luxury: "Executive",
  brutalist: "Creative",
  creative: "Creative",
  portfolio: "Creative",
};

function toCoreTemplate(
  theme: (typeof DESIGN_THEMES)[number],
  index: number
): TemplateMetadata & { category: CoreTemplateCategory } {
  return {
    id: `core-${theme.id}`,
    slug: theme.id,
    title: theme.name,
    category: CATEGORY_MAP[theme.aesthetic] ?? "Professional",
    industry: industryFor(theme.aesthetic),
    layout: layoutFor(theme.aesthetic),
    theme,
    tags: [theme.aesthetic, theme.mode],
    premium: index >= 6,
    animated: theme.animation !== "none",
    portfolio: theme.aesthetic === "portfolio" || theme.aesthetic === "creative",
    previewGradient:
      theme.palette.gradient ??
      `linear-gradient(145deg, ${theme.palette.primary} 0%, ${theme.palette.accent} 100%)`,
  };
}

function industryFor(aesthetic: string): string[] {
  const map: Record<string, string[]> = {
    minimal: ["Finance", "Consulting"],
    startup: ["Technology", "SaaS"],
    luxury: ["Executive", "Leadership"],
    cyber: ["Engineering", "AI"],
    glass: ["Design", "Product"],
    faang: ["Software", "Data"],
    brutalist: ["Design", "Media"],
    portfolio: ["Creative", "Freelance"],
  };
  return map[aesthetic] ?? ["General"];
}

function layoutFor(aesthetic: string): TemplateMetadata["layout"] {
  if (aesthetic === "portfolio" || aesthetic === "creative") return "card-grid";
  if (aesthetic === "faang" || aesthetic === "minimal") return "single-column";
  if (aesthetic === "luxury") return "sidebar";
  return "two-column";
}

/** 10 distinct core templates — no Compact/Pro/Executive variants */
export const CORE_TEMPLATES: (TemplateMetadata & { category: CoreTemplateCategory })[] =
  DESIGN_THEMES.map(toCoreTemplate);

export function getCoreTemplateBySlug(slug: string) {
  const base = slug.replace(/-(compact|executive|pro)$/, "");
  return CORE_TEMPLATES.find((t) => t.slug === slug || t.slug === base);
}

export function isAtsOptimized(template: TemplateMetadata): boolean {
  return template.theme.atsScore >= 85;
}
