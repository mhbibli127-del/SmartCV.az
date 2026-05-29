/**
 * Client-side resume save helpers — prevents replaceState / navigation loops.
 */

/** Update ?id= only when missing or different (avoids history.replaceState storms). */
export function syncResumeIdInUrl(
  resumeId: string,
  templateQuery?: string | null
): boolean {
  if (typeof window === "undefined" || !resumeId) return false;

  const url = new URL(window.location.href);
  const currentId = url.searchParams.get("id");
  if (currentId === resumeId) {
    if (templateQuery && url.searchParams.get("template") !== templateQuery) {
      url.searchParams.set("template", templateQuery);
      window.history.replaceState(null, "", url.toString());
      return true;
    }
    return false;
  }

  url.searchParams.set("id", resumeId);
  if (templateQuery) url.searchParams.set("template", templateQuery);
  window.history.replaceState(null, "", url.toString());
  return true;
}

/** Stable key for debounced autosave — avoids effect churn from array reference changes. */
export function buildEditorAutosaveFingerprint(
  title: string,
  background: string,
  elementCount: number,
  elementRevision: string
): string {
  return `${title}|${background}|${elementCount}|${elementRevision}`;
}

/** Cheap revision token from element ids + text lengths (not full JSON). */
export function revisionFromElements(
  elements: Array<{ id: string; content?: string; src?: string }>
): string {
  if (elements.length === 0) return "0";
  return elements
    .map((el) => `${el.id}:${(el.content ?? "").length}:${(el.src ?? "").length}`)
    .join("|");
}
