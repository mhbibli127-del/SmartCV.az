/** AI Resume OS — unified design system types */

export type AestheticStyle =
  | "minimal"
  | "corporate"
  | "startup"
  | "luxury"
  | "cyber"
  | "glass"
  | "brutalist"
  | "creative"
  | "faang"
  | "portfolio";

export type LayoutType = "single-column" | "two-column" | "sidebar" | "card-grid" | "timeline";
export type ThemeMode = "light" | "dark" | "auto";
export type AnimationLevel = "none" | "subtle" | "moderate" | "cinematic";
export type VisualDensity = "compact" | "balanced" | "spacious";

export interface FontPairing {
  id: string;
  heading: string;
  body: string;
  label: string;
}

export interface ColorPalette {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  gradient?: string;
  tags: string[];
}

export interface DesignEffects {
  glow: boolean;
  blur: number;
  shadowDepth: "none" | "soft" | "medium" | "lift";
  borderRadius: number;
  glassOpacity: number;
  animatedGradient: boolean;
}

export interface DesignTheme {
  id: string;
  name: string;
  aesthetic: AestheticStyle;
  mode: ThemeMode;
  palette: ColorPalette;
  fonts: FontPairing;
  spacing: number;
  density: VisualDensity;
  animation: AnimationLevel;
  effects: DesignEffects;
  atsScore: number;
  recruiterScore: number;
  modernity: number;
  creativity: number;
  minimalism: number;
}

export interface TemplateMetadata {
  id: string;
  slug: string;
  title: string;
  industry: string[];
  country?: string[];
  layout: LayoutType;
  theme: DesignTheme;
  tags: string[];
  premium: boolean;
  animated: boolean;
  portfolio: boolean;
  previewGradient: string;
}

export interface TemplateFilters {
  query?: string;
  aesthetic?: AestheticStyle[];
  industry?: string[];
  mode?: ThemeMode;
  minAts?: number;
  minModernity?: number;
  animation?: AnimationLevel[];
  layout?: LayoutType[];
  premium?: boolean;
  color?: string;
}

export interface DesignSuggestion {
  id: string;
  type: "layout" | "typography" | "color" | "content" | "ats" | "hierarchy";
  title: string;
  description: string;
  impact: "low" | "medium" | "high";
  autoFixable: boolean;
}

export interface CopilotMessage {
  id: string;
  role: "assistant" | "user" | "system";
  content: string;
  suggestions?: DesignSuggestion[];
  timestamp: number;
}
