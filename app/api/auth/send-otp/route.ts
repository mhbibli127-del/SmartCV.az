import { NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/token";
import { generateOTP } from "@/lib/otp";
import { saveOtp } from "@/lib/otp-store";
import { sendOtpEmail } from "@/lib/email";
import { validateEmail, authIssueToMessage } from "@/lib/auth-validation";

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

    const emailIssue = validateEmail(email);
    if (emailIssue) {
      return NextResponse.json(
        { error: authIssueToMessage(emailIssue) },
        { status: 400 }
      );
    }

    const code = generateOTP();
    await saveOtp(email, code);

    const delivery = await sendOtpEmail(email, code);
    const isDev = process.env.NODE_ENV === "development";

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      devMode: delivery.method === "console",
      ...(isDev && delivery.method === "console" ? { devCode: code } : {}),
    });
  } catch (error: unknown) {
    console.error("[send-otp]", error);
    return NextResponse.json(
      { error: "Failed to send OTP. Check EMAIL_* env on Vercel." },
      { status: 500 }
    );
  }
}
