import { NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/token";
import { generateOTP } from "@/lib/otp";
import { getLocalDb, saveLocalDb } from "@/lib/db";
import { sendOtpEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") ?? "";
    const tokenMatch = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
    const token = tokenMatch?.[1];
    const payload = token ? verifySessionToken(token) : null;

    const body = await request.json().catch(() => ({}));
    const email = String(body.email ?? payload?.email ?? "")
      .trim()
      .toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60_000).toISOString();

    const otps = getLocalDb();
    const filtered = otps.filter((o) => o.email.toLowerCase() !== email);
    saveLocalDb([...filtered, { email, code, expiresAt }]);

    const delivery = await sendOtpEmail(email, code);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      devMode: delivery.method === "console",
    });
  } catch (error: unknown) {
    console.error("[send-otp]", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
