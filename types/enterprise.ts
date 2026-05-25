/**
 * Enterprise type definitions — shared across services.
 */

export type ToneStyle =
  | "corporate"
  | "startup"
  | "creative"
  | "executive"
  | "minimalist"
  | "modern-tech"
  | "luxury"
  | "futuristic";

export type SourceType =
  | "prompt"
  | "pdf"
  | "linkedin"
  | "github"
  | "portfolio"
  | "job-description";

export interface ParsedSource {
  type: SourceType;
  rawText: string;
  structured?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface AIGenerateRequest {
  userId: string;
  sourceType: SourceType;
  input: unknown;
  toneStyle: ToneStyle;
  jobDescription?: string;
  language?: string;
  resumeId?: string;
}

export interface AIGenerateResult {
  generationId: string;
  status: "completed" | "queued" | "failed";
  content?: Record<string, unknown>;
  sections?: unknown[];
  atsScore?: number;
  error?: string;
}

export interface ResearchResult {
  query: string;
  snippets: { title: string; url: string; content: string }[];
  skills?: string[];
  salaryRange?: { min: number; max: number; currency: string };
  trends?: string[];
  fetchedAt: string;
}

export interface DesignIssue {
  id: string;
  severity: "low" | "medium" | "high";
  type: "spacing" | "typography" | "alignment" | "hierarchy" | "overflow" | "contrast";
  elementId?: string;
  message: string;
  autoFixable: boolean;
  suggestion?: string;
}

export interface ExportRequest {
  resumeId: string;
  userId: string;
  format: "pdf" | "png" | "docx" | "html";
  options?: {
    printOptimized?: boolean;
    atsOptimized?: boolean;
    dpi?: number;
  };
}

export interface ExportResult {
  exportId: string;
  status: "pending" | "processing" | "completed" | "failed";
  downloadUrl?: string;
  error?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export type JobType =
  | "ai-generation"
  | "pdf-export"
  | "embedding-index"
  | "research-fetch"
  | "email-send";

export interface QueueJob<T = unknown> {
  id: string;
  type: JobType;
  payload: T;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
}
