export {
  TEMPLATE_REGISTRY,
  findTemplateBySlug,
  getTemplateOrThrow,
  getEditorTemplate,
  normalizeTemplateSlug,
  type TemplateRegistryEntry,
} from "@/lib/template-engine/registry";

export {
  hydrateStudioTemplate,
  cancelTemplateHydration,
  type TemplateHydrationResult,
} from "@/lib/template-engine/hydrate";

export { clearEntireEditorState } from "@/lib/template-engine/reset";

export { switchStudioTemplate, clearEditorInteractionState } from "@/lib/studio-template-switch";
