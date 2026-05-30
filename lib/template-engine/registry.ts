import {
  EDITOR_TEMPLATES,
  getEditorTemplate,
} from "@/lib/cv-editor/template-catalog";
import {
  getDesignTemplateForSlug,
  normalizeTemplateSlug,
} from "@/lib/studio-template-apply";
import type { CvEditorTemplate } from "@/types/cv-editor";
import type { TemplateMetadata } from "@/types/design-system";

export interface TemplateRegistryEntry {
  id: string;
  slug: string;
  name: string;
  previewImage: string;
  editorTemplate: CvEditorTemplate;
  designTemplate: TemplateMetadata | null;
}

/** Central registry — all studio hydration reads from here. */
export const TEMPLATE_REGISTRY: TemplateRegistryEntry[] = EDITOR_TEMPLATES.map(
  (editorTemplate) => {
    const designTemplate = getDesignTemplateForSlug(editorTemplate.slug);
    return {
      id: editorTemplate.id,
      slug: editorTemplate.slug,
      name: editorTemplate.name,
      previewImage: editorTemplate.previewImage,
      editorTemplate,
      designTemplate: designTemplate ?? editorTemplate.source,
    };
  }
);

export function findTemplateBySlug(slugOrId: string | null): TemplateRegistryEntry | null {
  if (!slugOrId) return null;
  const normalized = normalizeTemplateSlug(slugOrId) ?? slugOrId;
  return (
    TEMPLATE_REGISTRY.find(
      (t) => t.slug === normalized || t.id === normalized || t.id === slugOrId
    ) ?? null
  );
}

export function getTemplateOrThrow(slugOrId: string): TemplateRegistryEntry {
  const entry = findTemplateBySlug(slugOrId);
  if (!entry) {
    throw new Error(`Template not found: ${slugOrId}`);
  }
  return entry;
}

export { getEditorTemplate, normalizeTemplateSlug };
