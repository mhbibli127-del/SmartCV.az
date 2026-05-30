import type { SectionDisplayStyle } from "@/types/cv-document";

export const SECTION_STYLE_OPTIONS: {
  id: SectionDisplayStyle;
  label: string;
  description: string;
}[] = [
  { id: "default", label: "Default", description: "Clean standard block" },
  { id: "timeline", label: "Timeline", description: "Vertical timeline line" },
  { id: "bordered", label: "Bordered", description: "Strong border frame" },
  { id: "compact", label: "Compact", description: "Tight spacing" },
  { id: "modern", label: "Modern", description: "Minimal underline accent" },
  { id: "cards", label: "Cards", description: "Elevated card look" },
];

export const PLACEHOLDER_CONTENT = [
  "Section content…",
  "Add your content here…",
  "Click to edit",
  "New text block",
];

export function isPlaceholderContent(value?: string): boolean {
  if (!value?.trim()) return true;
  const normalized = value.trim().toLowerCase();
  return PLACEHOLDER_CONTENT.some((p) => normalized === p.toLowerCase());
}
