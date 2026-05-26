/** Unified CV document schema — form + visual editor */
export type CVSectionType =
  | "personal"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "languages";

export interface CVSection {
  id: string;
  type: CVSectionType;
  title: string;
  content: unknown;
  order: number;
}

export interface EditorElement {
  id: string;
  type: "text" | "section" | "shape" | "image" | "divider";
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  fontWeight?: "normal" | "bold";
  sectionType?: CVSectionType;
  content?: string;
  locked?: boolean;
  /** shape */
  shapeType?: "rect" | "circle" | "line";
  cornerRadius?: number;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  /** image */
  src?: string;
}

export interface EditorCanvasState {
  width: number;
  height: number;
  elements: EditorElement[];
  background?: string;
}

import type { DesignTheme } from "@/types/design-system";

export interface CVContent {
  mode: "form" | "visual";
  sections?: CVSection[];
  canvas?: EditorCanvasState;
  templateId?: number;
  templateName?: string;
  generatorData?: Record<string, unknown>;
  designTheme?: {
    themeId: string;
    theme: DesignTheme;
    templateSlug?: string;
    templateId?: string;
  };
  metadata?: {
    version: number;
    createdAt?: string;
    updatedAt?: string;
  };
}

export interface CVDocument {
  id?: string;
  userId: string;
  userEmail: string;
  title: string;
  templateId: number;
  content: CVContent;
  status: "draft" | "completed";
  atsScore?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CVListItem {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
  mode: "form" | "visual";
}
