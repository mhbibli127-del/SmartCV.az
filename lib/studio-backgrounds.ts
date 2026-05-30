/** CV page background presets — solid colors and CSS gradients. */
export interface StudioBackgroundPreset {
  id: string;
  label: string;
  value: string;
  category: "solid" | "gradient" | "professional";
}

export const STUDIO_BACKGROUND_PRESETS: StudioBackgroundPreset[] = [
  { id: "white", label: "Pure White", value: "#ffffff", category: "solid" },
  { id: "off-white", label: "Off White", value: "#fafafa", category: "solid" },
  { id: "cream", label: "Cream", value: "#fffbeb", category: "solid" },
  { id: "light-gray", label: "Light Gray", value: "#f4f4f5", category: "solid" },
  { id: "slate-50", label: "Slate Mist", value: "#f8fafc", category: "solid" },
  { id: "ice-blue", label: "Ice Blue", value: "#f0f9ff", category: "solid" },
  { id: "mint", label: "Soft Mint", value: "#ecfdf5", category: "solid" },
  { id: "blush", label: "Blush", value: "#fff1f2", category: "solid" },
  { id: "lavender", label: "Lavender", value: "#f5f3ff", category: "solid" },
  { id: "charcoal", label: "Charcoal", value: "#18181b", category: "solid" },
  { id: "navy", label: "Navy", value: "#0f172a", category: "solid" },
  {
    id: "grad-sunset",
    label: "Sunset",
    value: "linear-gradient(135deg, #ff6b6b 0%, #f06595 50%, #845ef7 100%)",
    category: "gradient",
  },
  {
    id: "grad-ocean",
    label: "Ocean",
    value: "linear-gradient(160deg, #0ea5e9 0%, #6366f1 50%, #8b5cf6 100%)",
    category: "gradient",
  },
  {
    id: "grad-forest",
    label: "Forest",
    value: "linear-gradient(145deg, #059669 0%, #0d9488 50%, #134e4a 100%)",
    category: "gradient",
  },
  {
    id: "grad-peach",
    label: "Peach",
    value: "linear-gradient(180deg, #fff5f5 0%, #ffe4e6 40%, #ffffff 100%)",
    category: "gradient",
  },
  {
    id: "grad-sky",
    label: "Sky Fade",
    value: "linear-gradient(180deg, #e0f2fe 0%, #ffffff 55%)",
    category: "gradient",
  },
  {
    id: "grad-gold",
    label: "Gold Luxe",
    value: "linear-gradient(160deg, #0c1929 0%, #1a2f4a 50%, #0c1929 100%)",
    category: "professional",
  },
  {
    id: "grad-corporate",
    label: "Corporate",
    value: "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
    category: "professional",
  },
  {
    id: "grad-minimal",
    label: "Minimal Gray",
    value: "linear-gradient(135deg, #fafafa 0%, #e4e4e7 100%)",
    category: "professional",
  },
  {
    id: "grad-rose",
    label: "Rose",
    value: "linear-gradient(135deg, #fce7f3 0%, #fdf2f8 50%, #ffffff 100%)",
    category: "gradient",
  },
  { id: "sand", label: "Sand", value: "#fef3c7", category: "solid" },
  { id: "sage", label: "Sage", value: "#f0fdf4", category: "solid" },
  { id: "stone", label: "Stone", value: "#f5f5f4", category: "solid" },
  { id: "ink", label: "Ink", value: "#09090b", category: "solid" },
  {
    id: "grad-aurora",
    label: "Aurora",
    value: "linear-gradient(120deg, #22d3ee 0%, #a78bfa 45%, #f472b6 100%)",
    category: "gradient",
  },
  {
    id: "grad-midnight",
    label: "Midnight",
    value: "linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
    category: "gradient",
  },
  {
    id: "grad-warm-paper",
    label: "Warm Paper",
    value: "linear-gradient(180deg, #fff7ed 0%, #ffedd5 35%, #ffffff 100%)",
    category: "professional",
  },
  {
    id: "grad-executive",
    label: "Executive",
    value: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)",
    category: "professional",
  },
  {
    id: "grad-sidebar",
    label: "Sidebar Accent",
    value: "linear-gradient(90deg, #e0e7ff 0%, #e0e7ff 28%, #ffffff 28%, #ffffff 100%)",
    category: "professional",
  },
];
