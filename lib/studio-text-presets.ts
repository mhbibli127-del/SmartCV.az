import type { EditorElement } from "@/types/cv-document";

export interface StudioTextPreset {
  id: string;
  label: string;
  description: string;
  patch: Pick<
    EditorElement,
    "text" | "fontSize" | "fontWeight" | "fontStyle" | "lineHeight" | "letterSpacing" | "height"
  >;
}

export const STUDIO_TEXT_PRESETS: StudioTextPreset[] = [
  {
    id: "heading",
    label: "Heading",
    description: "Large title",
    patch: {
      text: "Your Name",
      fontSize: 28,
      fontWeight: "bold",
      lineHeight: 1.15,
      letterSpacing: -0.3,
      height: 36,
    },
  },
  {
    id: "subheading",
    label: "Subheading",
    description: "Role or tagline",
    patch: {
      text: "Senior Product Designer",
      fontSize: 16,
      fontWeight: "normal",
      lineHeight: 1.3,
      letterSpacing: 0,
      height: 24,
    },
  },
  {
    id: "body",
    label: "Body",
    description: "Paragraph text",
    patch: {
      text: "Write a short professional summary here.",
      fontSize: 12,
      fontWeight: "normal",
      lineHeight: 1.45,
      letterSpacing: 0,
      height: 48,
    },
  },
  {
    id: "caption",
    label: "Caption",
    description: "Small labels",
    patch: {
      text: "Caption text",
      fontSize: 10,
      fontWeight: "normal",
      lineHeight: 1.35,
      letterSpacing: 0.2,
      height: 16,
    },
  },
  {
    id: "contact",
    label: "Contact line",
    description: "Email · phone · city",
    patch: {
      text: "email@example.com · +994 50 000 00 00 · Baku",
      fontSize: 11,
      fontWeight: "normal",
      lineHeight: 1.35,
      letterSpacing: 0,
      height: 20,
    },
  },
];
