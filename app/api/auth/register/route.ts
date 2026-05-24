import { NextResponse } from "next/server";
import { createOrUpdateUser } from "@/lib/users";
import { signSessionToken } from "@/lib/token";
import { generateOTP } from "@/lib/otp";
import { getLocalDb, saveLocalDb } from "@/lib/db";
import { sendOtpEmail } from "@/lib/email";
import { setAuthStateCookie } from "@/lib/auth-cookie";

export const dynamic = "force-dynamic";

const PRE_VERIFICATION_TTL = 60 * 60; // 1 hour for pending OTP flow

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
      name?: string;
    };
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";
    const name = body.name?.trim() || "User";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const user = await createOrUpdateUser({ name, email, password });

    // Generate + persist OTP and dispatch the email immediately so the user
    // sees their code on the next screen without an extra "send" click.
    let otpDelivery: "sent" | "failed" = "sent";
    try {
      const code = generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60_000).toISOString();
      const otps = getLocalDb().filter((o) => o.email !== email);
      saveLocalDb([...otps, { email, code, expiresAt }]);
      await sendOtpEmail(email, code);
    } catch (err) {
      otpDelivery = "failed";
      // eslint-disable-next-line no-console
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
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: PRE_VERIFICATION_TTL,
    });
    setAuthStateCookie(response, PRE_VERIFICATION_TTL);

    return response;
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("[register]", error);
    const message =
      error instanceof Error ? error.message : "Failed to register";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
