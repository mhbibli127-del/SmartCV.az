import type { EditorElement } from "@/types/cv-document";
import type { DesignTheme } from "@/types/design-system";

const DRAFT_KEY = "smartcv-draft";

export interface StudioDraft {
  title: string;
  cvId: string | null;
  elements: EditorElement[];
  pageCount?: number;
  designTheme?: DesignTheme;
  selectedTemplateSlug?: string | null;
  updatedAt: number;
}

export function readStudioDraft(): StudioDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StudioDraft;
  } catch {
    return null;
  }
}

export function writeStudioDraft(draft: StudioDraft): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* quota exceeded — ignore */
  }
}

export function clearStudioDraft(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRAFT_KEY);
}

export function draftMatchesSession(
  draft: StudioDraft,
  cvId: string | null,
  templateSlug?: string | null
): boolean {
  if ((draft.cvId ?? null) !== (cvId ?? null)) return false;

  if (templateSlug) {
    const requested = templateSlug.trim().toLowerCase();
    const draftSlug = (draft.selectedTemplateSlug ?? "").trim().toLowerCase();
    return draftSlug === requested;
  }

  return true;
}
