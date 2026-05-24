import { NextResponse } from "next/server";
import { getLocalDb, saveLocalDb } from "@/lib/db";
import { setUserVerified } from "@/lib/users";
import { signSessionToken } from "@/lib/token";
import { setAuthStateCookie } from "@/lib/auth-cookie";

const VERIFIED_SESSION_MAX_AGE = 7 * 24 * 60 * 60;

export async function POST(request: Request) {
  try {
    const { email: rawEmail, otp } = await request.json();
    const email = String(rawEmail ?? "")
      .trim()
      .toLowerCase();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    const otps = getLocalDb();
    const record = otps.find(
      (o) => o.email.toLowerCase() === email && o.code === String(otp).trim()
    );

    if (!record) {
      return NextResponse.json({ error: "Invalid OTP code" }, { status: 400 });
    }

    if (new Date(record.expiresAt) < new Date()) {
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
    }

    await setUserVerified(email);
    saveLocalDb(otps.filter((o) => o.email.toLowerCase() !== email));

    const token = signSessionToken({ email, verified: true });

    const response = NextResponse.json({
      success: true,
      redirect: "/dashboard",
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: VERIFIED_SESSION_MAX_AGE,
    });
    setAuthStateCookie(response, VERIFIED_SESSION_MAX_AGE);

    return response;
  } catch (error: unknown) {
    console.error("[verify-otp]", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
