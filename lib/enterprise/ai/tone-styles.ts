import type { ToneStyle } from "@/types/enterprise";

export interface ToneStyleDefinition {
  id: ToneStyle;
  label: string;
  description: string;
  promptModifier: string;
  vocabulary: string[];
  avoid: string[];
}

export const TONE_STYLES: Record<ToneStyle, ToneStyleDefinition> = {
  corporate: {
    id: "corporate",
    label: "Corporate",
    description: "Formal, metrics-driven language for finance and consulting",
    promptModifier:
      "Write in a formal corporate tone. Emphasize quantifiable achievements, ROI, stakeholder management, and compliance. Use third-person sparingly; prefer strong action verbs.",
    vocabulary: ["delivered", "optimized", "stakeholders", "KPIs", "governance", "P&L"],
    avoid: ["casual slang", "emoji", "first-person overuse"],
  },
  startup: {
    id: "startup",
    label: "Startup",
    description: "Impact-focused, ownership-driven for early-stage tech",
    promptModifier:
      "Write in an energetic startup tone. Highlight ownership, speed, 0→1 building, cross-functional collaboration, and scrappy problem-solving.",
    vocabulary: ["shipped", "scaled", "owned", "iterative", "MVP", "growth"],
    avoid: ["bureaucratic language", "overly formal titles"],
  },
  creative: {
    id: "creative",
    label: "Creative",
    description: "Personality-forward for design and marketing roles",
    promptModifier:
      "Write with creative flair while remaining professional. Showcase portfolio-worthy projects, brand impact, and visual/UX thinking.",
    vocabulary: ["crafted", "designed", "storytelling", "brand", "campaign", "visual"],
    avoid: ["dry bullet lists", "generic corporate speak"],
  },
  executive: {
    id: "executive",
    label: "Executive",
    description: "Leadership and strategy for C-suite roles",
    promptModifier:
      "Write at executive level. Emphasize vision, board-level impact, organizational transformation, M&A, and revenue growth at scale.",
    vocabulary: ["led", "transformed", "strategic", "board", "revenue", "enterprise"],
    avoid: ["task-level details", "junior language"],
  },
  minimalist: {
    id: "minimalist",
    label: "Minimalist",
    description: "Dense, ATS-optimized facts with zero fluff",
    promptModifier:
      "Write minimally. Every word must earn its place. Prioritize ATS keyword density, clear section headers, and scannable bullet points.",
    vocabulary: ["achieved", "managed", "developed", "implemented"],
    avoid: ["adjectives without metrics", "long paragraphs"],
  },
  "modern-tech": {
    id: "modern-tech",
    label: "Modern Tech",
    description: "Engineering-focused with systems and scale language",
    promptModifier:
      "Write for modern tech roles. Highlight systems design, cloud architecture, CI/CD, performance, reliability, and team technical leadership.",
    vocabulary: ["architected", "deployed", "microservices", "latency", "uptime", "Kubernetes"],
    avoid: ["outdated tech buzzwords without context"],
  },
  luxury: {
    id: "luxury",
    label: "Luxury",
    description: "Refined tone for hospitality and premium brands",
    promptModifier:
      "Write with refined, service-excellence language. Emphasize guest experience, attention to detail, premium brand standards, and discretion.",
    vocabulary: ["curated", "bespoke", "excellence", "concierge", "premium", "hospitality"],
    avoid: ["casual tone", "tech jargon unless relevant"],
  },
  futuristic: {
    id: "futuristic",
    label: "Futuristic",
    description: "Innovation-forward for AI, robotics, and emerging tech",
    promptModifier:
      "Write with forward-looking innovation tone. Highlight AI/ML, automation, research, patents, and cutting-edge project work.",
    vocabulary: ["pioneered", "AI-driven", "autonomous", "research", "novel", "breakthrough"],
    avoid: ["legacy-only focus", "outdated methodologies"],
  },
};

export const TONE_STYLE_LIST = Object.values(TONE_STYLES);

export function getToneStyle(id: ToneStyle): ToneStyleDefinition {
  return TONE_STYLES[id] ?? TONE_STYLES["modern-tech"];
}

export function buildTonePrompt(style: ToneStyle): string {
  const def = getToneStyle(style);
  return [
    def.promptModifier,
    `Preferred vocabulary: ${def.vocabulary.join(", ")}.`,
    `Avoid: ${def.avoid.join(", ")}.`,
  ].join("\n");
}
