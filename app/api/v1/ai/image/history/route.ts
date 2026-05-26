import { NextRequest } from "next/server";
import { withApiGuard, apiErrorResponse, jsonOk } from "@/lib/api/guard";
import { listGenerationHistory } from "@/lib/ai/leonardo/history";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user } = await withApiGuard(req, { requireAuth: true });
    const limit = Math.min(
      50,
      parseInt(req.nextUrl.searchParams.get("limit") ?? "20", 10) || 20
    );

    const history = await listGenerationHistory(user!.email, limit);
    return jsonOk({ success: true, history });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
