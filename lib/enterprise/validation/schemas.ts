import type { ToneStyle, SourceType } from "@/types/enterprise";

const TONE_STYLES: ToneStyle[] = [
  "corporate",
  "startup",
  "creative",
  "executive",
  "minimalist",
  "modern-tech",
  "luxury",
  "futuristic",
];

const SOURCE_TYPES: SourceType[] = [
  "prompt",
  "pdf",
  "linkedin",
  "github",
  "portfolio",
  "job-description",
];

export interface AIGenerateInput {
  sourceType: SourceType;
  input: string | Record<string, unknown>;
  toneStyle?: ToneStyle;
  jobDescription?: string;
  language?: string;
  resumeId?: string;
}

export interface ExportRequestInput {
  resumeId: string;
  format: "pdf" | "png" | "docx" | "html";
  options?: {
    printOptimized?: boolean;
    atsOptimized?: boolean;
    dpi?: number;
  };
}

export function parseAIGenerateBody(body: unknown): {
  ok: true;
  data: AIGenerateInput;
} | {
  ok: false;
  error: string;
} {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body" };
  }
  const b = body as Record<string, unknown>;

  const sourceType = b.sourceType as SourceType;
  if (!SOURCE_TYPES.includes(sourceType)) {
    return { ok: false, error: `sourceType must be one of: ${SOURCE_TYPES.join(", ")}` };
  }

  if (b.input === undefined || b.input === null) {
    return { ok: false, error: "input is required" };
  }

  const toneStyle = (b.toneStyle as ToneStyle) ?? "modern-tech";
  if (!TONE_STYLES.includes(toneStyle)) {
    return { ok: false, error: "Invalid toneStyle" };
  }

  return {
    ok: true,
    data: {
      sourceType,
      input: b.input as string | Record<string, unknown>,
      toneStyle,
      jobDescription: typeof b.jobDescription === "string" ? b.jobDescription.slice(0, 10000) : undefined,
      language: typeof b.language === "string" ? b.language.slice(0, 10) : "en",
      resumeId: typeof b.resumeId === "string" ? b.resumeId : undefined,
    },
  };
}

export function parseExportBody(body: unknown): {
  ok: true;
  data: ExportRequestInput;
} | {
  ok: false;
  error: string;
} {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body" };
  }
  const b = body as Record<string, unknown>;
  const formats = ["pdf", "png", "docx", "html"] as const;

  if (typeof b.resumeId !== "string" || !b.resumeId) {
    return { ok: false, error: "resumeId is required" };
  }
  const format = b.format as (typeof formats)[number];
  if (!formats.includes(format)) {
    return { ok: false, error: "format must be pdf, png, docx, or html" };
  }

  return {
    ok: true,
    data: { resumeId: b.resumeId, format, options: b.options as ExportRequestInput["options"] },
  };
}

export { TONE_STYLES, SOURCE_TYPES };
