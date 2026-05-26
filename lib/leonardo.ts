import {
  getLeonardoApiKey,
  getLeonardoModelId,
  isLeonardoConfigured,
} from "@/lib/env";
import { enhanceLeonardoPrompt } from "@/lib/ai/leonardo/prompt-engine";
import { getLeonardoPreset } from "@/lib/ai/leonardo/presets";
import {
  cacheGenerationResult,
  getCachedGeneration,
} from "@/lib/ai/leonardo/cache";
import {
  saveGenerationHistory,
  updateGenerationHistory,
} from "@/lib/ai/leonardo/history";
import type {
  LeonardoGenerationRequest,
  LeonardoGenerationResult,
  LeonardoGenerationStatus,
} from "@/lib/ai/leonardo/types";

const LEONARDO_API_BASE = "https://cloud.leonardo.ai/api/rest/v1";

interface LeonardoApiGenerationResponse {
  sdGenerationJob?: { generationId: string };
  generationId?: string;
}

interface LeonardoApiStatusResponse {
  generations_by_pk?: {
    status: string;
    generated_images?: Array<{ id: string; url: string }>;
  };
}

async function leonardoFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const key = getLeonardoApiKey();
  if (!key) throw new Error("Leonardo AI is not configured.");

  const res = await fetch(`${LEONARDO_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Leonardo API error ${res.status}: ${body.slice(0, 200)}`);
  }

  return res.json() as Promise<T>;
}

function mapStatus(raw: string): LeonardoGenerationStatus {
  const upper = raw.toUpperCase();
  if (upper.includes("COMPLETE") || upper === "SUCCESS") return "COMPLETE";
  if (upper.includes("FAIL")) return "FAILED";
  return "PENDING";
}

/**
 * Start a Leonardo AI image generation job.
 */
export async function createLeonardoGeneration(
  request: LeonardoGenerationRequest
): Promise<LeonardoGenerationResult> {
  if (!isLeonardoConfigured()) {
    throw new Error("Leonardo AI is not configured. Set LEONARDO_API_KEY.");
  }

  const preset = getLeonardoPreset(request.preset);
  const enhanced = enhanceLeonardoPrompt(request.prompt, request.preset);
  const modelId = getLeonardoModelId() ?? preset.modelId;

  const body = {
    prompt: enhanced.prompt,
    negative_prompt: request.negativePrompt ?? enhanced.negativePrompt,
    modelId,
    width: request.width ?? preset.width,
    height: request.height ?? preset.height,
    num_images: request.numImages ?? 1,
    alchemy: preset.alchemy ?? true,
    photoReal: preset.photoReal ?? false,
    ...(preset.presetStyle ? { presetStyle: preset.presetStyle } : {}),
  };

  const data = await leonardoFetch<LeonardoApiGenerationResponse>("/generations", {
    method: "POST",
    body: JSON.stringify(body),
  });

  const generationId =
    data.sdGenerationJob?.generationId ?? data.generationId;
  if (!generationId) {
    throw new Error("Leonardo did not return a generation ID.");
  }

  const result: LeonardoGenerationResult = {
    generationId,
    status: "PENDING",
    images: [],
    prompt: request.prompt,
    enhancedPrompt: enhanced.prompt,
    preset: request.preset,
    modelId,
    createdAt: new Date().toISOString(),
  };

  await saveGenerationHistory({
    userId: request.userId,
    generationId,
    preset: request.preset,
    prompt: request.prompt,
    enhancedPrompt: enhanced.prompt,
    status: "PENDING",
    imageUrls: [],
    modelId,
    cvId: request.cvId,
  });

  await cacheGenerationResult(result);
  return result;
}

/**
 * Poll Leonardo generation status and return images when complete.
 */
export async function getLeonardoGeneration(
  generationId: string,
  userId?: string
): Promise<LeonardoGenerationResult> {
  const cached = await getCachedGeneration(generationId);
  if (cached?.status === "COMPLETE") return cached;

  const data = await leonardoFetch<LeonardoApiStatusResponse>(
    `/generations/${generationId}`
  );

  const pk = data.generations_by_pk;
  const status = mapStatus(pk?.status ?? "PENDING");
  const images =
    pk?.generated_images?.map((img) => ({ id: img.id, url: img.url })) ?? [];

  const result: LeonardoGenerationResult = {
    generationId,
    status,
    images,
    prompt: cached?.prompt ?? "",
    enhancedPrompt: cached?.enhancedPrompt,
    preset: cached?.preset ?? "custom",
    modelId: cached?.modelId ?? getLeonardoModelId() ?? "",
    createdAt: cached?.createdAt ?? new Date().toISOString(),
  };

  await cacheGenerationResult(result);

  if (userId) {
    await updateGenerationHistory(userId, generationId, {
      status,
      imageUrls: images.map((i) => i.url),
    });
  }

  return result;
}

/** Wait for generation with exponential backoff (max ~30s). */
export async function waitForLeonardoGeneration(
  generationId: string,
  userId?: string,
  maxAttempts = 12
): Promise<LeonardoGenerationResult> {
  let delay = 1500;
  for (let i = 0; i < maxAttempts; i++) {
    const result = await getLeonardoGeneration(generationId, userId);
    if (result.status === "COMPLETE" || result.status === "FAILED") {
      return result;
    }
    await new Promise((r) => setTimeout(r, delay));
    delay = Math.min(delay * 1.4, 5000);
  }
  return getLeonardoGeneration(generationId, userId);
}

export { isLeonardoConfigured };
