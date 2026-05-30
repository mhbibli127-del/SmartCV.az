import { useEditorStore } from "@/lib/editor-store";
import { hydrateStudioTemplate } from "@/lib/template-engine/hydrate";

export type TemplateSwitchResult = {
  ok: boolean;
  sessionKey: string;
  slug: string;
  renderVersion: number;
};

/** Canva-style template switch — delegates to hydration engine. */
export async function switchStudioTemplate(
  slugOrId: string,
  options?: { title?: string; cvId?: string | null; persistDraft?: boolean }
): Promise<TemplateSwitchResult> {
  const result = await hydrateStudioTemplate(slugOrId, {
    cvId: options?.cvId,
    title: options?.title,
    persistDraft: options?.persistDraft,
  });

  return {
    ok: result.ok,
    sessionKey: result.sessionKey,
    slug: result.slug,
    renderVersion: result.renderVersion,
  };
}

export { clearEntireEditorState } from "@/lib/template-engine/reset";

/** Clear transient editor UI without changing elements (e.g. before export). */
export function clearEditorInteractionState(): void {
  useEditorStore.getState().clearInteractionState();
}
