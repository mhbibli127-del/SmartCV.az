import { NextRequest, NextResponse } from "next/server";
import { createOrUpdateUser } from "@/lib/users";
import { signSessionToken } from "@/lib/token";
import { generateOTP } from "@/lib/otp";
import { saveOtp } from "@/lib/otp-store";
import { sendOtpEmail } from "@/lib/email";
import { validateRegisterForm, authIssueToMessage } from "@/lib/auth-validation";
import {
  cookieSecureFromRequest,
  setAuthStateCookie,
  sessionCookieOptions,
} from "@/lib/auth-cookie";
import { handleApiError, tooManyRequests } from "@/lib/api-errors";
import { clientRateLimitKey, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const PRE_VERIFICATION_TTL = 60 * 60; // 1 hour for pending OTP flow

export async function POST(request: NextRequest) {
  try {
    const secure = cookieSecureFromRequest(request);
    const limit = rateLimit(clientRateLimitKey(request, "auth:register"), 6, 60 * 60_000);
    if (!limit.ok) {
      return tooManyRequests(limit.retryAfterSec);
    }

    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
      confirmPassword?: string;
      name?: string;
    };
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";
    const confirmPassword = body.confirmPassword ?? password;
    const name = body.name?.trim() || "User";

    const validationIssues = validateRegisterForm({
      name,
      email: email ?? "",
      password,
      confirmPassword,
    });
    if (validationIssues.length > 0) {
      return NextResponse.json(
        { error: authIssueToMessage(validationIssues[0]!) },
        { status: 400 }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await createOrUpdateUser({ name, email, password });

    // Generate + persist OTP and dispatch the email immediately so the user
    // sees their code on the next screen without an extra "send" click.
    let otpDelivery: "sent" | "failed" = "sent";
    let devCode: string | undefined;
    try {
      const code = generateOTP();
      await saveOtp(email, code);
      const delivery = await sendOtpEmail(email, code);
      if (process.env.NODE_ENV === "development" && delivery.method === "console") {
        devCode = code;
      }
    } catch (err) {
      otpDelivery = "failed";
      console.error("[register] OTP dispatch failed:", err);
    }

    // Short-lived unverified session so the user can reach /verify-otp.
    const token = signSessionToken({
      email: String(user.email),
      verified: false,
    });

    const response = NextResponse.json({
      success: true,
      message: "User registered. Please verify the code we sent to your email.",
      otpDelivery,
      redirect: `/verify-otp?email=${encodeURIComponent(email)}`,
      ...(devCode ? { devCode } : {}),
    });

    response.cookies.set(
      "token",
      token,
      sessionCookieOptions(secure, PRE_VERIFICATION_TTL)
    );
    setAuthStateCookie(response, PRE_VERIFICATION_TTL, secure);

    return response;
  } catch (error) {
    return handleApiError(error, "auth/register POST", "Failed to register");
  }
}
