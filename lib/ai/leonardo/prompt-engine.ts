import type { LeonardoPresetId } from "@/lib/ai/leonardo/types";
import { getLeonardoPreset } from "@/lib/ai/leonardo/presets";

const PROMPT_BANNED = [
  /nude|nsfw|explicit|gore|violence/i,
  /child|minor|underage/i,
];

export interface EnhancedPromptResult {
  prompt: string;
  negativePrompt: string;
  moderated: boolean;
  moderationReason?: string;
}

/**
 * Enhances user prompts with preset context and applies content moderation.
 */
export function enhanceLeonardoPrompt(
  userPrompt: string,
  presetId: LeonardoPresetId
): EnhancedPromptResult {
  const preset = getLeonardoPreset(presetId);
  const trimmed = userPrompt.trim().slice(0, 1000);

  for (const pattern of PROMPT_BANNED) {
    if (pattern.test(trimmed)) {
      return {
        prompt: preset.promptPrefix,
        negativePrompt: preset.negativePrompt,
        moderated: true,
        moderationReason: "Prompt contained restricted content and was replaced with a safe preset.",
      };
    }
  }

  const prompt =
    presetId === "custom"
      ? `${preset.promptPrefix}. ${trimmed}`
      : `${preset.promptPrefix}. ${trimmed}`.trim();

  return {
    prompt: prompt.slice(0, 1500),
    negativePrompt: preset.negativePrompt,
    moderated: false,
  };
}

/** Suggest prompt improvements for resume context */
export function suggestPromptForRole(role: string, industry?: string): string {
  const r = role.trim() || "professional";
  const ind = industry?.trim() ? ` in ${industry}` : "";
  return `Professional ${r}${ind}, modern resume visual, premium quality, clean composition`;
}
