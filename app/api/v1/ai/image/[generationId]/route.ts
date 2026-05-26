import { NextRequest } from "next/server";
import { withApiGuard, apiErrorResponse, jsonOk } from "@/lib/api/guard";
import { isLeonardoConfigured } from "@/lib/env";
import { getLeonardoGeneration, waitForLeonardoGeneration } from "@/lib/leonardo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/** GET /api/v1/ai/image/[generationId]?wait=1 */
export async function GET(
  req: NextRequest,
  { params }: { params: { generationId: string } }
) {
  try {
    if (!isLeonardoConfigured()) {
      return jsonOk({ error: "Leonardo AI not configured." }, 503);
    }

    const { user } = await withApiGuard(req, { requireAuth: true });
    const wait = req.nextUrl.searchParams.get("wait") === "1";

    const generationId = params.generationId?.trim();
    if (!generationId) {
      return jsonOk({ error: "Missing generation ID." }, 400);
    }

    const result = wait
      ? await waitForLeonardoGeneration(generationId, user!.email)
      : await getLeonardoGeneration(generationId, user!.email);

    return jsonOk({ success: true, generation: result });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
