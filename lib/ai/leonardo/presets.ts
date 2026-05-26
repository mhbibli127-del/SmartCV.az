import type { LeonardoPresetId } from "@/lib/ai/leonardo/types";

export interface LeonardoPreset {
  id: LeonardoPresetId;
  label: string;
  description: string;
  width: number;
  height: number;
  modelId: string;
  promptPrefix: string;
  negativePrompt: string;
  alchemy?: boolean;
  photoReal?: boolean;
  presetStyle?: string;
}

/** Production presets for resume/portfolio AI visuals */
export const LEONARDO_PRESETS: Record<LeonardoPresetId, LeonardoPreset> = {
  avatar: {
    id: "avatar",
    label: "AI Avatar",
    description: "Professional headshot-style avatar for CV profiles",
    width: 512,
    height: 512,
    modelId: "aaaf8714-2580-4345-8029-d348c4cd56a4",
    promptPrefix:
      "Professional corporate headshot portrait, neutral background, soft studio lighting, sharp focus, recruiter-friendly, LinkedIn profile photo quality",
    negativePrompt: "cartoon, anime, blurry, distorted face, watermark, text, logo",
    alchemy: true,
  },
  "profile-photo": {
    id: "profile-photo",
    label: "Profile Photo",
    description: "Clean professional profile photo",
    width: 768,
    height: 768,
    modelId: "aaaf8714-2580-4345-8029-d348c4cd56a4",
    promptPrefix:
      "Ultra-realistic professional profile photo, business attire, confident expression, minimal background, premium photography",
    negativePrompt: "low quality, oversaturated, cartoon, duplicate limbs, watermark",
    photoReal: true,
    alchemy: true,
  },
  "cinematic-background": {
    id: "cinematic-background",
    label: "Cinematic Background",
    description: "Premium cinematic backdrop for resume headers",
    width: 1536,
    height: 640,
    modelId: "aaaf8714-2580-4345-8029-d348c4cd56a4",
    promptPrefix:
      "Cinematic wide background for modern resume header, subtle gradient, premium SaaS aesthetic, depth of field, no people, no text",
    negativePrompt: "text, watermark, logo, cluttered, noisy, low resolution",
    alchemy: true,
  },
  "startup-portfolio": {
    id: "startup-portfolio",
    label: "Startup Portfolio",
    description: "Bold startup-style portfolio hero visual",
    width: 1280,
    height: 720,
    modelId: "aaaf8714-2580-4345-8029-d348c4cd56a4",
    promptPrefix:
      "Modern startup portfolio hero image, tech innovation, clean geometric shapes, premium product design, vibrant but professional",
    negativePrompt: "messy, text, watermark, stock photo cliché",
    alchemy: true,
  },
  "recruiter-graphic": {
    id: "recruiter-graphic",
    label: "Recruiter Graphic",
    description: "ATS-friendly professional visual accent",
    width: 1024,
    height: 512,
    modelId: "aaaf8714-2580-4345-8029-d348c4cd56a4",
    promptPrefix:
      "Minimal professional graphic accent for resume, corporate blue tones, clean lines, recruiter-friendly, no text",
    negativePrompt: "text, watermark, busy patterns, cartoon",
    alchemy: true,
  },
  "resume-header": {
    id: "resume-header",
    label: "Resume Header",
    description: "Elegant header banner for CV documents",
    width: 1600,
    height: 400,
    modelId: "aaaf8714-2580-4345-8029-d348c4cd56a4",
    promptPrefix:
      "Elegant resume header banner, subtle texture, executive professional style, premium print quality, no text",
    negativePrompt: "text, watermark, logo, faces",
    alchemy: true,
  },
  custom: {
    id: "custom",
    label: "Custom",
    description: "Custom prompt with platform defaults",
    width: 1024,
    height: 1024,
    modelId: "aaaf8714-2580-4345-8029-d348c4cd56a4",
    promptPrefix: "Professional high-quality visual for resume platform",
    negativePrompt: "low quality, watermark, text, blurry",
    alchemy: true,
  },
};

export function getLeonardoPreset(id: LeonardoPresetId): LeonardoPreset {
  return LEONARDO_PRESETS[id] ?? LEONARDO_PRESETS.custom;
}
