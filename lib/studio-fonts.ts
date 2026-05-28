/** Google Fonts loaded on demand in Studio (not bundled at app root). */
export interface StudioFontOption {
  id: string;
  label: string;
  css: string;
  googleFamily?: string;
}

export const STUDIO_FONT_CATALOG: StudioFontOption[] = [
  { id: "inter", label: "Inter", css: "Inter, sans-serif", googleFamily: "Inter" },
  { id: "poppins", label: "Poppins", css: "Poppins, sans-serif", googleFamily: "Poppins" },
  { id: "lora", label: "Lora", css: "Lora, serif", googleFamily: "Lora" },
  {
    id: "playfair",
    label: "Playfair Display",
    css: "Playfair Display, serif",
    googleFamily: "Playfair+Display",
  },
  { id: "dm-sans", label: "DM Sans", css: "DM Sans, sans-serif", googleFamily: "DM+Sans" },
  {
    id: "ibm-plex",
    label: "IBM Plex Sans",
    css: "IBM Plex Sans, sans-serif",
    googleFamily: "IBM+Plex+Sans",
  },
  {
    id: "space-grotesk",
    label: "Space Grotesk",
    css: "Space Grotesk, sans-serif",
    googleFamily: "Space+Grotesk",
  },
  { id: "manrope", label: "Manrope", css: "Manrope, sans-serif", googleFamily: "Manrope" },
  { id: "outfit", label: "Outfit", css: "Outfit, sans-serif", googleFamily: "Outfit" },
  { id: "sora", label: "Sora", css: "Sora, sans-serif", googleFamily: "Sora" },
  {
    id: "merriweather",
    label: "Merriweather",
    css: "Merriweather, serif",
    googleFamily: "Merriweather",
  },
  { id: "urbanist", label: "Urbanist", css: "Urbanist, sans-serif", googleFamily: "Urbanist" },
  { id: "jakarta", label: "Plus Jakarta Sans", css: "Plus Jakarta Sans, sans-serif", googleFamily: "Plus+Jakarta+Sans" },
];

const loaded = new Set<string>();

export function loadGoogleFont(familyParam: string): void {
  if (typeof document === "undefined" || loaded.has(familyParam)) return;
  loaded.add(familyParam);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${familyParam}:wght@400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

export function loadFontOption(font: StudioFontOption): void {
  if (font.googleFamily) loadGoogleFont(font.googleFamily);
}
