import { NextRequest, NextResponse } from "next/server";
import { signSessionToken } from "@/lib/token";
import { verifyAndConsumeOtp } from "@/lib/otp-store";
import {
  cookieSecureFromRequest,
  setAuthStateCookie,
  sessionCookieOptions,
} from "@/lib/auth-cookie";
import { validateEmail, AUTH_LIMITS, authIssueToMessage } from "@/lib/auth-validation";

export const dynamic = "force-dynamic";

const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      otp?: string;
    };
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();

    const emailIssue = validateEmail(email);
    if (emailIssue) {
      return NextResponse.json(
        { error: authIssueToMessage(emailIssue) },
        { status: 400 }
      );
    }

    if (!body.otp || String(body.otp).trim().length !== AUTH_LIMITS.otpLength) {
      return NextResponse.json(
        { error: "6 rəqəmli kodu tam daxil edin." },
        { status: 400 }
      );
    }

    const valid = await verifyAndConsumeOtp(email, String(body.otp).trim());
    if (!valid) {
      return NextResponse.json(
        { error: "Kod səhvdir və ya vaxtı keçib. Yenidən göndərin." },
        { status: 400 }
      );
    }

    const token = signSessionToken({ email, verified: true });
    const secure = cookieSecureFromRequest(request);
    const response = NextResponse.json({
      success: true,
      redirect: "/dashboard",
    });

    response.cookies.set(
      "token",
      token,
      sessionCookieOptions(secure, SESSION_MAX_AGE)
    );
    setAuthStateCookie(response, SESSION_MAX_AGE, secure);

    return response;
  } catch (error: unknown) {
    console.error("[verify-otp]", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
