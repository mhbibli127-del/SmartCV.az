import type { ResumeContent } from "@/types/resume";

export function estimateAtsScore(content: ResumeContent): number {
  const elements = content.canvas?.elements ?? [];
  if (!Array.isArray(elements) || elements.length === 0) return 45;

  let filled = 0;
  let totalChars = 0;

  for (const raw of elements) {
    const el = raw as { content?: string; type?: string };
    if (el.type === "image") continue;
    const text = el.content?.trim() ?? "";
    if (text.length > 2) {
      filled += 1;
      totalChars += text.length;
    }
  }

  const density = Math.min(30, Math.floor(totalChars / 40));
  const coverage = Math.min(40, filled * 5);
  return Math.min(99, Math.max(35, 25 + coverage + density));
}
