import type { TemplateMetadata } from "@/types/design-system";
import {
  DISTINCT_TEMPLATES,
  defToEditorTemplate,
} from "@/lib/cv-editor/template-definitions";

export type CoreTemplateCategory = "Professional" | "Modern" | "Creative" | "Executive";

/** 12 distinct CV templates — each with unique layout, not recolors */
export const CORE_TEMPLATES: (TemplateMetadata & { category: CoreTemplateCategory })[] =
  DISTINCT_TEMPLATES.map((def) => {
    const editor = defToEditorTemplate(def);
    return {
      ...editor.source,
      category: def.category,
    };
  });

export function getCoreTemplateBySlug(slug: string) {
  return CORE_TEMPLATES.find((t) => t.slug === slug || t.id === slug);
}

export function isAtsOptimized(template: TemplateMetadata): boolean {
  return template.theme.atsScore >= 85;
}
