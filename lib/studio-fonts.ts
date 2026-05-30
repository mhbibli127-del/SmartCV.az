/** Google Fonts loaded on demand in Studio (not bundled at app root). */
export type StudioFontCategory = "sans" | "serif" | "mono" | "display";

export interface StudioFontOption {
  id: string;
  label: string;
  css: string;
  googleFamily?: string;
  category?: StudioFontCategory;
}

export const STUDIO_FONT_CATEGORIES: { id: StudioFontCategory; label: string }[] = [
  { id: "sans", label: "Sans" },
  { id: "serif", label: "Serif" },
  { id: "display", label: "Display" },
  { id: "mono", label: "Mono" },
];

export interface StudioFontPairing {
  id: string;
  label: string;
  headingFontId: string;
  bodyFontId: string;
}

export const STUDIO_FONT_PAIRINGS: StudioFontPairing[] = [
  { id: "modern-clean", label: "Modern Clean", headingFontId: "inter", bodyFontId: "inter" },
  { id: "startup", label: "Startup Bold", headingFontId: "poppins", bodyFontId: "inter" },
  { id: "executive", label: "Executive", headingFontId: "playfair", bodyFontId: "lora" },
  { id: "tech", label: "Tech / Dev", headingFontId: "jetbrains", bodyFontId: "ibm-plex" },
  { id: "creative", label: "Creative", headingFontId: "space-grotesk", bodyFontId: "dm-sans" },
  { id: "minimal", label: "Minimal Serif", headingFontId: "cormorant", bodyFontId: "source-sans" },
  { id: "friendly", label: "Friendly", headingFontId: "nunito", bodyFontId: "open-sans" },
];
export const STUDIO_FONT_CATALOG: StudioFontOption[] = [
  { id: "inter", label: "Inter", css: "Inter, sans-serif", googleFamily: "Inter", category: "sans" },
  { id: "poppins", label: "Poppins", css: "Poppins, sans-serif", googleFamily: "Poppins", category: "sans" },
  { id: "roboto", label: "Roboto", css: "Roboto, sans-serif", googleFamily: "Roboto", category: "sans" },
  { id: "open-sans", label: "Open Sans", css: "Open Sans, sans-serif", googleFamily: "Open+Sans", category: "sans" },
  { id: "montserrat", label: "Montserrat", css: "Montserrat, sans-serif", googleFamily: "Montserrat", category: "sans" },
  { id: "dm-sans", label: "DM Sans", css: "DM Sans, sans-serif", googleFamily: "DM+Sans", category: "sans" },
  { id: "ibm-plex", label: "IBM Plex Sans", css: "IBM Plex Sans, sans-serif", googleFamily: "IBM+Plex+Sans", category: "sans" },
  { id: "space-grotesk", label: "Space Grotesk", css: "Space Grotesk, sans-serif", googleFamily: "Space+Grotesk", category: "sans" },
  { id: "manrope", label: "Manrope", css: "Manrope, sans-serif", googleFamily: "Manrope", category: "sans" },
  { id: "outfit", label: "Outfit", css: "Outfit, sans-serif", googleFamily: "Outfit", category: "sans" },
  { id: "sora", label: "Sora", css: "Sora, sans-serif", googleFamily: "Sora", category: "sans" },
  { id: "urbanist", label: "Urbanist", css: "Urbanist, sans-serif", googleFamily: "Urbanist", category: "sans" },
  { id: "jakarta", label: "Plus Jakarta Sans", css: "Plus Jakarta Sans, sans-serif", googleFamily: "Plus+Jakarta+Sans", category: "sans" },
  { id: "raleway", label: "Raleway", css: "Raleway, sans-serif", googleFamily: "Raleway", category: "sans" },
  { id: "nunito", label: "Nunito", css: "Nunito, sans-serif", googleFamily: "Nunito", category: "sans" },
  { id: "rubik", label: "Rubik", css: "Rubik, sans-serif", googleFamily: "Rubik", category: "sans" },
  { id: "work-sans", label: "Work Sans", css: "Work Sans, sans-serif", googleFamily: "Work+Sans", category: "sans" },
  { id: "fira-sans", label: "Fira Sans", css: "Fira Sans, sans-serif", googleFamily: "Fira+Sans", category: "sans" },
  { id: "source-sans", label: "Source Sans 3", css: "Source Sans 3, sans-serif", googleFamily: "Source+Sans+3", category: "sans" },
  { id: "lora", label: "Lora", css: "Lora, serif", googleFamily: "Lora", category: "serif" },
  { id: "playfair", label: "Playfair Display", css: "Playfair Display, serif", googleFamily: "Playfair+Display", category: "serif" },
  { id: "merriweather", label: "Merriweather", css: "Merriweather, serif", googleFamily: "Merriweather", category: "serif" },
  { id: "crimson", label: "Crimson Pro", css: "Crimson Pro, serif", googleFamily: "Crimson+Pro", category: "serif" },
  { id: "libre-baskerville", label: "Libre Baskerville", css: "Libre Baskerville, serif", googleFamily: "Libre+Baskerville", category: "serif" },
  { id: "cormorant", label: "Cormorant Garamond", css: "Cormorant Garamond, serif", googleFamily: "Cormorant+Garamond", category: "serif" },
  { id: "georgia", label: "Georgia", css: "Georgia, serif", category: "serif" },
  { id: "jetbrains", label: "JetBrains Mono", css: "JetBrains Mono, monospace", googleFamily: "JetBrains+Mono", category: "mono" },
  { id: "noto-sans", label: "Noto Sans", css: "Noto Sans, sans-serif", googleFamily: "Noto+Sans", category: "sans" },
  { id: "lato", label: "Lato", css: "Lato, sans-serif", googleFamily: "Lato", category: "sans" },
  { id: "figtree", label: "Figtree", css: "Figtree, sans-serif", googleFamily: "Figtree", category: "sans" },
  { id: "mulish", label: "Mulish", css: "Mulish, sans-serif", googleFamily: "Mulish", category: "sans" },
  { id: "karla", label: "Karla", css: "Karla, sans-serif", googleFamily: "Karla", category: "sans" },
  { id: "lexend", label: "Lexend", css: "Lexend, sans-serif", googleFamily: "Lexend", category: "sans" },
  { id: "eb-garamond", label: "EB Garamond", css: "EB Garamond, serif", googleFamily: "EB+Garamond", category: "serif" },
  { id: "source-serif", label: "Source Serif 4", css: "Source Serif 4, serif", googleFamily: "Source+Serif+4", category: "serif" },
  { id: "fraunces", label: "Fraunces", css: "Fraunces, serif", googleFamily: "Fraunces", category: "display" },
  { id: "oswald", label: "Oswald", css: "Oswald, sans-serif", googleFamily: "Oswald", category: "display" },
  { id: "bebas", label: "Bebas Neue", css: "Bebas Neue, sans-serif", googleFamily: "Bebas+Neue", category: "display" },
  { id: "fira-code", label: "Fira Code", css: "Fira Code, monospace", googleFamily: "Fira+Code", category: "mono" },
  { id: "roboto-mono", label: "Roboto Mono", css: "Roboto Mono, monospace", googleFamily: "Roboto+Mono", category: "mono" },
];

export function getStudioFontById(id: string): StudioFontOption | undefined {
  return STUDIO_FONT_CATALOG.find((f) => f.id === id);
}

export function getStudioFontsByCategory(category: StudioFontCategory | "all"): StudioFontOption[] {
  if (category === "all") return STUDIO_FONT_CATALOG;
  return STUDIO_FONT_CATALOG.filter((f) => f.category === category);
}

export function preloadStudioFonts(fontIds: string[]): void {
  for (const id of fontIds) {
    const opt = getStudioFontById(id);
    if (opt) loadFontOption(opt);
  }
}
const loaded = new Set<string>();

export function loadGoogleFont(familyParam: string): void {
  if (typeof document === "undefined" || loaded.has(familyParam)) return;
  loaded.add(familyParam);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${familyParam}:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap`;
  document.head.appendChild(link);
}

export function loadFontOption(font: StudioFontOption): void {
  if (font.googleFamily) loadGoogleFont(font.googleFamily);
}

/** Resolve a theme/font-pairing name to a CSS font-family stack. */
export function resolveStudioFontCss(name: string): string {
  const normalized = name.trim().toLowerCase();
  const match = STUDIO_FONT_CATALOG.find(
    (f) =>
      f.label.toLowerCase() === normalized ||
      f.css.toLowerCase().startsWith(normalized) ||
      f.id === normalized.replace(/\s+/g, "-")
  );
  return match?.css ?? `${name}, sans-serif`;
}

export function loadFontByName(name: string): void {
  const normalized = name.trim().toLowerCase();
  const match = STUDIO_FONT_CATALOG.find(
    (f) =>
      f.label.toLowerCase() === normalized ||
      f.css.toLowerCase().startsWith(normalized)
  );
  if (match) loadFontOption(match);
}

/** Match a canvas `fontFamily` value to a catalog entry. */
export function resolveFontFromCss(family: string): StudioFontOption | undefined {
  const normalized = family.toLowerCase().split(",")[0]?.trim() ?? "";
  return STUDIO_FONT_CATALOG.find(
    (f) =>
      f.css.toLowerCase().includes(normalized) ||
      f.label.toLowerCase() === normalized ||
      f.id === normalized.replace(/\s+/g, "-")
  );
}