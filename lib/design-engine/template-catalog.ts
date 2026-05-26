import type { TemplateFilters, TemplateMetadata } from "@/types/design-system";
import { getCoreTemplateBySlug } from "@/lib/design-engine/core-templates";
import { DESIGN_THEMES } from "./themes";

/** Extensible template catalog — scales to DB/API; seeded with premium presets + variants */
function buildTemplateCatalog(): TemplateMetadata[] {
  const base = DESIGN_THEMES.map((theme, i) => toTemplate(theme, i, ""));

  const variants = DESIGN_THEMES.flatMap((theme, i) => {
    const suffixes = [
      { suffix: "compact", density: "compact" as const, spacingDelta: -4 },
      { suffix: "executive", density: "spacious" as const, spacingDelta: 4 },
      { suffix: "pro", density: "balanced" as const, spacingDelta: 0 },
    ];
    return suffixes.map((v, j) =>
      toTemplate(
        {
          ...theme,
          id: `${theme.id}-${v.suffix}`,
          name: `${theme.name} ${v.suffix.charAt(0).toUpperCase()}${v.suffix.slice(1)}`,
          spacing: Math.max(8, theme.spacing + v.spacingDelta),
          density: v.density,
        },
        i + j + 1,
        `-${v.suffix}`
      )
    );
  });

  return [...base, ...variants];
}

function toTemplate(
  theme: (typeof DESIGN_THEMES)[number],
  index: number,
  slugSuffix: string
): TemplateMetadata {
  return {
    id: `tpl-${theme.id}`,
    slug: `${theme.id}${slugSuffix}`,
    title: theme.name,
    industry: industryForAesthetic(theme.aesthetic),
    layout: layoutForAesthetic(theme.aesthetic),
    theme,
    tags: [
      theme.aesthetic,
      theme.mode,
      theme.density,
      ...theme.palette.tags,
      theme.animation !== "none" ? "animated" : "static",
    ],
    premium: index >= 4,
    animated: theme.animation !== "none",
    portfolio: theme.aesthetic === "portfolio" || theme.aesthetic === "creative",
    previewGradient:
      theme.palette.gradient ??
      `linear-gradient(135deg, ${theme.palette.primary}, ${theme.palette.accent})`,
  };
}

export const TEMPLATE_CATALOG: TemplateMetadata[] = buildTemplateCatalog();

function industryForAesthetic(aesthetic: string): string[] {
  const map: Record<string, string[]> = {
    minimal: ["Finance", "Consulting", "Legal"],
    corporate: ["Finance", "Consulting", "Healthcare"],
    startup: ["Technology", "SaaS", "Product"],
    luxury: ["Hospitality", "Executive", "Real Estate"],
    cyber: ["AI", "Robotics", "Gaming"],
    glass: ["Design", "Marketing", "SaaS"],
    faang: ["Software", "Engineering", "Data Science"],
    brutalist: ["Design", "Architecture", "Creative"],
    creative: ["Design", "Art", "Media"],
    portfolio: ["Design", "Photography", "Freelance"],
  };
  return map[aesthetic] ?? ["General"];
}

function layoutForAesthetic(aesthetic: string): TemplateMetadata["layout"] {
  if (aesthetic === "portfolio" || aesthetic === "creative") return "card-grid";
  if (aesthetic === "faang" || aesthetic === "minimal") return "single-column";
  if (aesthetic === "luxury") return "sidebar";
  return "two-column";
}

export function filterTemplates(filters: TemplateFilters): TemplateMetadata[] {
  let results = [...TEMPLATE_CATALOG];

  if (filters.query) {
    const q = filters.query.toLowerCase();
    results = results.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.includes(q)) ||
        t.industry.some((ind) => ind.toLowerCase().includes(q))
    );
  }

  if (filters.aesthetic?.length) {
    results = results.filter((t) => filters.aesthetic!.includes(t.theme.aesthetic));
  }

  if (filters.industry?.length) {
    results = results.filter((t) =>
      t.industry.some((ind) => filters.industry!.includes(ind))
    );
  }

  if (filters.mode) {
    results = results.filter((t) => t.theme.mode === filters.mode);
  }

  if (filters.minAts != null) {
    results = results.filter((t) => t.theme.atsScore >= filters.minAts!);
  }

  if (filters.minModernity != null) {
    results = results.filter((t) => t.theme.modernity >= filters.minModernity!);
  }

  if (filters.animation?.length) {
    results = results.filter((t) => filters.animation!.includes(t.theme.animation));
  }

  if (filters.layout?.length) {
    results = results.filter((t) => filters.layout!.includes(t.layout));
  }

  if (filters.premium != null) {
    results = results.filter((t) => t.premium === filters.premium);
  }

  if (filters.color) {
    const c = filters.color.toLowerCase();
    results = results.filter(
      (t) =>
        t.theme.palette.primary.toLowerCase().includes(c) ||
        t.theme.palette.accent.toLowerCase().includes(c) ||
        t.tags.includes(c)
    );
  }

  return results.sort((a, b) => b.theme.recruiterScore - a.theme.recruiterScore);
}

export function getTemplateBySlug(slug: string): TemplateMetadata | undefined {
  return getCoreTemplateBySlug(slug) ?? TEMPLATE_CATALOG.find((t) => t.slug === slug);
}
