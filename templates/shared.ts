import { A4_HEIGHT, A4_WIDTH } from "@/lib/layout-engine";
import type { CvEditorElement } from "@/types/cv-editor";

export { A4_WIDTH, A4_HEIGHT };

export interface TemplateTheme {
  primary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
  surface?: string;
}

export interface TemplateFonts {
  heading: string;
  body: string;
}

let z = 1;

export function resetZIndex() {
  z = 1;
}

export function el(
  partial: Omit<CvEditorElement, "zIndex" | "rotation" | "style"> & {
    style?: Partial<CvEditorElement["style"]>;
    rotation?: number;
  }
): CvEditorElement {
  const style: CvEditorElement["style"] = {
    fontSize: 14,
    fontWeight: "normal",
    textAlign: "left",
    lineHeight: 1.4,
    ...partial.style,
  };
  return {
    rotation: partial.rotation ?? 0,
    style,
    zIndex: z++,
    id: partial.id,
    type: partial.type,
    x: partial.x,
    y: partial.y,
    width: partial.width,
    height: partial.height,
    content: partial.content,
    locked: partial.locked,
    src: partial.src,
    sectionType: partial.sectionType,
  };
}

export interface ResumeSampleData {
  name: string;
  title: string;
  contact: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
  languages: string;
}

export const SAMPLE: ResumeSampleData = {
  name: "Sophia Bennett",
  title: "Senior Product Designer",
  contact: "sophia.bennett@email.com  •  +1 (555) 234-5678  •  San Francisco, CA",
  summary:
    "Product designer with 8+ years crafting intuitive digital experiences at Google, Spotify, and Notion. Expert in design systems, user research, and shipping products that drive measurable business outcomes.",
  experience:
    "Senior Product Designer — Google\n2021 – Present\n• Led core app redesign, increasing engagement 42%\n• Built design system adopted by 30+ teams\n\nProduct Designer — Spotify\n2017 – 2021\n• Shipped mobile & web experiences for 100M+ users\n\nProduct Designer — Notion\n2015 – 2017\n• Partnered with PMs on roadmap and user testing",
  education:
    "MS, Human-Computer Interaction\nStanford University — 2015\n\nBFA, Interaction Design\nRhode Island School of Design — 2013",
  skills: "Figma\nReact\nUI/UX\nBranding\nDesign Systems\nPrototyping\nUser Research",
  languages: "English — Native\nSpanish — Fluent\nFrench — Conversational",
};

/** Local bundled portrait — works offline and avoids external CORS failures. */
export const DEFAULT_PORTRAIT_SRC = "/samples/default-portrait.svg";

/** Default avatar for template image slots. */
export const SAMPLE_PHOTO_URL = DEFAULT_PORTRAIT_SRC;
