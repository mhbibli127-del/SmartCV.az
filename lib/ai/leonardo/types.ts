/** Leonardo AI generation types */

export type LeonardoPresetId =
  | "avatar"
  | "profile-photo"
  | "cinematic-background"
  | "startup-portfolio"
  | "recruiter-graphic"
  | "resume-header"
  | "custom";

export type LeonardoGenerationStatus = "PENDING" | "COMPLETE" | "FAILED";

export interface LeonardoGenerationRequest {
  preset: LeonardoPresetId;
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  numImages?: number;
  userId: string;
  cvId?: string;
  styleReference?: string;
}

export interface LeonardoGenerationResult {
  generationId: string;
  status: LeonardoGenerationStatus;
  images: Array<{ id: string; url: string }>;
  prompt: string;
  enhancedPrompt?: string;
  preset: LeonardoPresetId;
  modelId: string;
  createdAt: string;
}

export interface LeonardoHistoryEntry {
  _id?: string;
  userId: string;
  generationId: string;
  preset: LeonardoPresetId;
  prompt: string;
  enhancedPrompt?: string;
  status: LeonardoGenerationStatus;
  imageUrls: string[];
  modelId: string;
  cvId?: string;
  createdAt: Date;
  updatedAt: Date;
}
