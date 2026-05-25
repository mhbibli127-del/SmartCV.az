import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import { changeUserPassword } from "@/lib/users";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current and new password are required" },
        { status: 400 }
      );
    }

    const result = await changeUserPassword(auth.email, currentPassword, newPassword);
    if (!result.ok) {
      const status =
        result.code === "WRONG_PASSWORD" || result.code === "WEAK_PASSWORD" ? 400 : 403;
      return NextResponse.json({ error: result.error, code: result.code }, { status });
    }

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("[user/password]", error);
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
  }
}
