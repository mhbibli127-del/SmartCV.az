import type { TemplateMetadata } from "@/types/design-system";

export type CvElementType = "text" | "image" | "section";

export interface CvElementStyle {
  fontSize?: number;
  fontWeight?: string | number;
  fontStyle?: "normal" | "italic";
  textDecoration?: "none" | "underline";
  textAlign?: "left" | "center" | "right";
  color?: string;
  background?: string;
  borderRadius?: number;
  opacity?: number;
  fontFamily?: string;
  lineHeight?: number;
  letterSpacing?: number;
  padding?: number;
  border?: string;
  boxShadow?: string;
  textShadow?: string;
}

export interface CvEditorElement {
  id: string;
  type: CvElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  content: string;
  locked?: boolean;
  src?: string;
  sectionType?: string;
  style: CvElementStyle;
  zIndex: number;
}

export interface CvEditorTemplate {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  previewImage: string;
  description: string;
  premium: boolean;
  atsOptimized: boolean;
  colors: {
    primary: string;
    accent: string;
    background: string;
    text: string;
    muted: string;
    surface?: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  layout: string;
  slug: string;
  source: TemplateMetadata;
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export type LeftSidebarSection =
  | "templates"
  | "text"
  | "experience"
  | "education"
  | "skills"
  | "languages"
  | "projects"
  | "certificates"
  | "colors"
  | "fonts"
  | "layout"
  | "background";
