import type { EditorElement } from "@/types/cv-document";
import { useEditorStore } from "@/lib/editor-store";
import { useDesignStore } from "@/lib/design-store";
import { buildStudioElementsForTemplateAsync } from "@/lib/studio-template-apply";
import { writeStudioDraft } from "@/lib/studio-draft";
import { clearEntireEditorState } from "@/lib/template-engine/reset";
import { findTemplateBySlug, normalizeTemplateSlug } from "@/lib/template-engine/registry";

export type TemplateHydrationResult = {
  ok: boolean;
  slug: string;
  sessionKey: string;
  renderVersion: number;
  elements: EditorElement[];
};

let hydrationGeneration = 0;

function cloneElements(elements: EditorElement[]): EditorElement[] {
  return structuredClone(elements);
}

/**
 * Full template hydration: reset → preload → replace canvas → bump render version.
 * Never merges with previous template layers.
 */
export async function hydrateStudioTemplate(
  slugOrId: string,
  options?: {
    cvId?: string | null;
    title?: string;
    persistDraft?: boolean;
    skipReset?: boolean;
  }
): Promise<TemplateHydrationResult> {
  const generation = ++hydrationGeneration;
  const slug = normalizeTemplateSlug(slugOrId) ?? slugOrId;
  const entry = findTemplateBySlug(slug);

  if (!entry) {
    return {
      ok: false,
      slug,
      sessionKey: slug,
      renderVersion: useEditorStore.getState().renderVersion,
      elements: [],
    };
  }

  if (!options?.skipReset) {
    clearEntireEditorState();
  }

  const built = await buildStudioElementsForTemplateAsync(slug);
  if (generation !== hydrationGeneration) {
    return {
      ok: false,
      slug,
      sessionKey: slug,
      renderVersion: useEditorStore.getState().renderVersion,
      elements: [],
    };
  }

  if (!built.length) {
    return {
      ok: false,
      slug,
      sessionKey: slug,
      renderVersion: useEditorStore.getState().renderVersion,
      elements: [],
    };
  }

  const themed = cloneElements(built);
  useDesignStore.getState().setTemplateMeta(entry.designTemplate ?? entry.editorTemplate.source);

  const renderVersion = useEditorStore.getState().hydrateTemplateCanvas(themed, slug);
  const sessionKey = `${slug}-${renderVersion}`;

  if (options?.persistDraft !== false && options?.title !== undefined) {
    writeStudioDraft({
      title: options.title,
      cvId: options.cvId ?? null,
      elements: themed,
      pageCount: useEditorStore.getState().pageCount,
      designTheme: useDesignStore.getState().activeTheme,
      selectedTemplateSlug: slug,
      updatedAt: Date.now(),
    });
  }

  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

  return {
    ok: true,
    slug,
    sessionKey,
    renderVersion,
    elements: themed,
  };
}

export function cancelTemplateHydration(): void {
  hydrationGeneration += 1;
}

export function getHydrationGeneration(): number {
  return hydrationGeneration;
}
