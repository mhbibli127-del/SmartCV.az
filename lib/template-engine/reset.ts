import { useEditorStore } from "@/lib/editor-store";
import { useDesignStore } from "@/lib/design-store";

/** Hard reset all editor + design session state (no canvas elements). */
export function clearEntireEditorState(): void {
  useEditorStore.getState().resetEditorState();
  useDesignStore.getState().resetTemplateSession();
}
