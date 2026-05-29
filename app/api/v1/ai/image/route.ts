import { NextRequest } from "next/server";
import { parseJsonBody } from "@/lib/safe-route";
import { withApiGuard, apiErrorResponse, jsonOk } from "@/lib/api/guard";
import { isLeonardoConfigured } from "@/lib/env";
import { createLeonardoGeneration } from "@/lib/leonardo";
import { LEONARDO_PRESETS } from "@/lib/ai/leonardo/presets";
import { sanitizePrompt } from "@/lib/security/sanitize";
import type { LeonardoPresetId } from "@/lib/ai/leonardo/types";
import { captureAIUsageServer } from "@/lib/analytics/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const VALID_PRESETS = new Set(Object.keys(LEONARDO_PRESETS));

export async function GET() {
  return jsonOk({
    version: "v1",
    configured: isLeonardoConfigured(),
    presets: Object.values(LEONARDO_PRESETS).map((p) => ({
      id: p.id,
      label: p.label,
      description: p.description,
      width: p.width,
      height: p.height,
    })),
  });
}

export async function POST(req: NextRequest) {
  const started = Date.now();
  try {
    if (!isLeonardoConfigured()) {
      return jsonOk(
        { error: "Leonardo AI is not configured.", code: "NOT_CONFIGURED" },
        503
      );
    }

    const { user } = await withApiGuard(req, {
      requireAuth: true,
      rateLimit: { action: "ai_image", limit: 10, windowSeconds: 60 },
      rateLimitIp: { action: "ai_image_ip", limit: 20, windowSeconds: 60 },
    });

    const body = await parseJsonBody(req);
    const presetRaw = typeof body.preset === "string" ? body.preset : "custom";
    const preset = VALID_PRESETS.has(presetRaw as LeonardoPresetId)
      ? (presetRaw as LeonardoPresetId)
      : "custom";
    const prompt = sanitizePrompt(String(body.prompt ?? ""));
    const cvId = typeof body.cvId === "string" ? body.cvId.slice(0, 64) : undefined;

    if (!prompt) {
      return jsonOk({ error: "Prompt is required.", code: "MISSING_PROMPT" }, 400);
    }

    const result = await createLeonardoGeneration({
      preset,
      prompt,
      userId: user!.email,
      cvId,
      numImages: 1,
    });

    captureAIUsageServer(user!.email, {
      feature: "leonardo",
      action: "ai_image_generate",
      success: true,
      durationMs: Date.now() - started,
    });

    return jsonOk({ success: true, generation: result });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
