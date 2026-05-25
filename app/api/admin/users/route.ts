import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAuthError } from "@/lib/admin-auth";
import { listAllSaasUsers, getSaasAnalytics } from "@/lib/saas-user";

export const dynamic = "force-dynamic";

function adminError(err: unknown) {
  if (err instanceof AdminAuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error("[admin/users]", err);
  return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
}

/** GET — all SaaS users + analytics (super admin only) */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const [users, analytics] = await Promise.all([
      listAllSaasUsers(),
      getSaasAnalytics(),
    ]);

    return NextResponse.json({ users, analytics, total: users.length });
  } catch (err) {
    return adminError(err);
  }
}
