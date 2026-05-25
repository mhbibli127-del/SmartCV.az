import type { EditorElement } from "@/types/cv-document";
import type { DesignIssue } from "@/types/enterprise";
import { A4_HEIGHT, A4_WIDTH, CANVAS_PADDING, GRID_SIZE } from "@/lib/layout-engine";

/**
 * Rule-based design intelligence — detects layout issues without AI latency.
 * AI enhancement available via orchestrator for complex fixes.
 */
export function analyzeDesign(elements: EditorElement[]): DesignIssue[] {
  const issues: DesignIssue[] = [];

  for (const el of elements) {
    // Overflow beyond A4 bounds
    if (el.x + el.width > A4_WIDTH - CANVAS_PADDING) {
      issues.push({
        id: `overflow-x-${el.id}`,
        severity: "high",
        type: "overflow",
        elementId: el.id,
        message: `Element "${el.id}" extends beyond the right page margin.`,
        autoFixable: true,
        suggestion: `Move element left or reduce width to fit within ${A4_WIDTH}px canvas.`,
      });
    }
    if (el.y + el.height > A4_HEIGHT - CANVAS_PADDING) {
      issues.push({
        id: `overflow-y-${el.id}`,
        severity: "high",
        type: "overflow",
        elementId: el.id,
        message: `Element "${el.id}" extends below the page boundary.`,
        autoFixable: true,
        suggestion: "Move element up or reduce content to fit A4 page.",
      });
    }

    // Typography hierarchy
    if (el.type === "text" && el.fontSize && el.fontSize < 10) {
      issues.push({
        id: `typography-small-${el.id}`,
        severity: "medium",
        type: "typography",
        elementId: el.id,
        message: "Text may be too small for print readability (below 10pt).",
        autoFixable: true,
        suggestion: "Increase font size to at least 11pt for body text.",
      });
    }

    // Grid alignment
    if (el.x % GRID_SIZE !== 0 || el.y % GRID_SIZE !== 0) {
      issues.push({
        id: `alignment-${el.id}`,
        severity: "low",
        type: "alignment",
        elementId: el.id,
        message: `Element "${el.id}" is off the ${GRID_SIZE}px grid.`,
        autoFixable: true,
        suggestion: "Enable snap-to-grid or align to nearest grid line.",
      });
    }
  }

  // Spacing between stacked elements
  const sorted = [...elements].sort((a, b) => a.y - b.y);
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]!;
    const curr = sorted[i]!;
    const gap = curr.y - (prev.y + prev.height);
    if (gap > 0 && gap < 8) {
      issues.push({
        id: `spacing-${prev.id}-${curr.id}`,
        severity: "medium",
        type: "spacing",
        message: `Insufficient vertical spacing (${gap}px) between elements.`,
        autoFixable: true,
        suggestion: "Increase gap to at least 16px for visual breathing room.",
      });
    }
  }

  return issues;
}

export function autoFixDesign(elements: EditorElement[]): EditorElement[] {
  return elements.map((el) => {
    let { x, y, width, fontSize } = el;

    // Snap to grid
    x = Math.round(x / GRID_SIZE) * GRID_SIZE;
    y = Math.round(y / GRID_SIZE) * GRID_SIZE;

    // Clamp to A4
    const maxWidth = A4_WIDTH - CANVAS_PADDING * 2;
    if (width > maxWidth) width = maxWidth;
    if (x + width > A4_WIDTH - CANVAS_PADDING) {
      x = A4_WIDTH - CANVAS_PADDING - width;
    }
    if (y + el.height > A4_HEIGHT - CANVAS_PADDING) {
      y = A4_HEIGHT - CANVAS_PADDING - el.height;
    }

    // Minimum font size
    if (el.type === "text" && fontSize && fontSize < 10) {
      fontSize = 11;
    }

    return { ...el, x, y, width, ...(fontSize ? { fontSize } : {}) };
  });
}

export function generateColorPalette(seed?: string): string[] {
  const base = seed ?? "smartcv";
  const hash = base.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const palettes = [
    ["#18181b", "#52525b", "#fafafa", "#3b82f6"],
    ["#0f172a", "#334155", "#f8fafc", "#6366f1"],
    ["#1c1917", "#78716c", "#fafaf9", "#059669"],
    ["#18181b", "#71717a", "#ffffff", "#dc2626"],
  ];
  return palettes[hash % palettes.length]!;
}
