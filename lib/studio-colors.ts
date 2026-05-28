const RECENT_COLORS_KEY = "smartcv-recent-colors";
const MAX_RECENT = 8;

export function readRecentColors(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_COLORS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

export function pushRecentColor(color: string): string[] {
  const normalized = color.toLowerCase();
  const next = [normalized, ...readRecentColors().filter((c) => c !== normalized)].slice(
    0,
    MAX_RECENT
  );
  if (typeof window !== "undefined") {
    localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(next));
  }
  return next;
}

export const THEME_COLOR_PRESETS = [
  { id: "professional", name: "Professional", accent: "#3b82f6", gradient: undefined },
  { id: "emerald", name: "Emerald", accent: "#059669", gradient: undefined },
  { id: "violet", name: "Violet", accent: "#7c3aed", gradient: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)" },
  { id: "sunset", name: "Sunset", accent: "#ea580c", gradient: "linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fbbf24 100%)" },
  { id: "ocean", name: "Ocean", accent: "#0284c7", gradient: "linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)" },
  { id: "rose", name: "Rose", accent: "#e11d48", gradient: "linear-gradient(135deg, #e11d48 0%, #fb7185 100%)" },
] as const;

export const ACCENT_SWATCHES = [
  "#18181b",
  "#3b82f6",
  "#6366f1",
  "#059669",
  "#d97706",
  "#e11d48",
  "#7c3aed",
  "#0284c7",
  "#d4af37",
  "#71717a",
];
