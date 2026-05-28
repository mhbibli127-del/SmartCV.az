import {
  IBM_Plex_Sans,
  Inter,
  Lora,
  Playfair_Display,
  Poppins,
  Space_Grotesk,
} from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

export const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-playfair",
});

export const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-lora",
});

export const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-ibm-plex",
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-space-grotesk",
});

export const studioFontVariables = [
  inter.variable,
  poppins.variable,
  playfair.variable,
  lora.variable,
  ibmPlexSans.variable,
  spaceGrotesk.variable,
].join(" ");

export const STUDIO_FONT_FAMILIES = [
  { id: "inter", label: "Inter", css: "Inter, sans-serif" },
  { id: "poppins", label: "Poppins", css: "Poppins, sans-serif" },
  { id: "playfair", label: "Playfair Display", css: "Playfair Display, serif" },
  { id: "lora", label: "Lora", css: "Lora, serif" },
  { id: "ibm-plex", label: "IBM Plex Sans", css: "IBM Plex Sans, sans-serif" },
  { id: "space-grotesk", label: "Space Grotesk", css: "Space Grotesk, sans-serif" },
  { id: "dm-sans", label: "DM Sans", css: "DM Sans, sans-serif" },
  { id: "manrope", label: "Manrope", css: "Manrope, sans-serif" },
  { id: "outfit", label: "Outfit", css: "Outfit, sans-serif" },
  { id: "sora", label: "Sora", css: "Sora, sans-serif" },
  { id: "merriweather", label: "Merriweather", css: "Merriweather, serif" },
  { id: "urbanist", label: "Urbanist", css: "Urbanist, sans-serif" },
  { id: "jakarta", label: "Plus Jakarta Sans", css: "Plus Jakarta Sans, sans-serif" },
] as const;

export { STUDIO_FONT_CATALOG, loadFontOption } from "@/lib/studio-fonts";
