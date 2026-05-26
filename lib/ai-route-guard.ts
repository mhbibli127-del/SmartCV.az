import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import { assertCanUseAI, incrementAiUsed } from "@/lib/ai-limit";

export class AiRouteError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
  }
}

/** Auth + AI limit gate for protected AI routes */
export async function requireAiAccess(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user?.email) {
    throw new AiRouteError("Unauthorized", 401);
  }

  const aiCheck = await assertCanUseAI(user.email);
  if (!aiCheck.allowed) {
    throw new AiRouteError(aiCheck.error, 403, aiCheck.code);
  }

  return user.email;
}

export async function recordAiUsage(
  email: string,
  action = "ai_generate",
  meta?: {
    feature?: string;
    model?: string;
    success?: boolean;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    estimatedCostUsd?: number;
    durationMs?: number;
    errorCode?: string;
  }
) {
  await incrementAiUsed(email).catch((err) => {
    console.error("[ai-route] incrementAiUsed failed:", err);
  });

  try {
    const db = await import("@/lib/mongodb").then((m) => m.getDatabase());
    await db.collection("interactions").insertOne({
      userEmail: email.trim().toLowerCase(),
      action,
      page: "/dashboard/generator",
      timestamp: new Date(),
      metadata: meta ?? {},
    });
  } catch {
    /* optional analytics store */
  }

  try {
    const { captureAIUsageServer } = await import("@/lib/analytics/server");
    captureAIUsageServer(email, {
      feature: meta?.feature ?? "ai",
      action,
      success: meta?.success ?? true,
      model: meta?.model,
      promptTokens: meta?.promptTokens,
      completionTokens: meta?.completionTokens,
      totalTokens: meta?.totalTokens,
      estimatedCostUsd: meta?.estimatedCostUsd,
      durationMs: meta?.durationMs,
      errorCode: meta?.errorCode,
    });
  } catch {
    /* posthog optional */
  }
}

export function aiErrorResponse(err: unknown) {
  if (err instanceof AiRouteError) {
    return NextResponse.json(
      { error: err.message, code: err.code },
      { status: err.status }
    );
  }
  console.error("[ai-route]", err);
  return NextResponse.json({ error: "AI request failed" }, { status: 500 });
}
