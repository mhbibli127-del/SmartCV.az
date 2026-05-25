import { getAuthenticatedUser } from "@/lib/session";
import { SUPER_ADMIN_EMAIL } from "@/lib/admin-config";
import type { NextRequest } from "next/server";

export { SUPER_ADMIN_EMAIL };

export class AdminAuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Only mhbibli127@gmail.com may access admin routes. */
export async function requireAdmin(req: NextRequest): Promise<{ email: string }> {
  const auth = await getAuthenticatedUser(req);
  if (!auth?.email) {
    throw new AdminAuthError("Unauthorized", 401);
  }

  const email = auth.email.toLowerCase().trim();
  if (email !== SUPER_ADMIN_EMAIL.toLowerCase()) {
    throw new AdminAuthError("Forbidden — super admin access required", 403);
  }

  return { email };
}
