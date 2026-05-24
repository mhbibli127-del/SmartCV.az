import { NextRequest, NextResponse } from "next/server";
import { checkUserCredentials } from "@/lib/users";
import { signSessionToken } from "@/lib/token";
import { generateOTP } from "@/lib/otp";
import { getLocalDb, saveLocalDb } from "@/lib/db";
import { sendOtpEmail } from "@/lib/email";
import { setAuthStateCookie } from "@/lib/auth-cookie";

export const dynamic = "force-dynamic";

const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
    };
      const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const result = await checkUserCredentials(email, password);

    if (!result.ok) {
      if (result.reason === "unverified") {
        // Send a fresh OTP so the user can complete verification.
        try {
          const code = generateOTP();
          const expiresAt = new Date(Date.now() + 5 * 60_000).toISOString();
          const otps = getLocalDb().filter((o) => o.email !== email);
          saveLocalDb([...otps, { email, code, expiresAt }]);
          await sendOtpEmail(email, code);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error("[login] Failed to dispatch verification OTP:", err);
        }

        const token = signSessionToken({ email, verified: false });
        const response = NextResponse.json(
          {
            error: "Email not verified. We've sent a new verification code.",
            unverified: true,
            redirect: `/verify-otp?email=${encodeURIComponent(email)}`,
          },
          { status: 403 }
        );

        response.cookies.set("token", token, {
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60,
        });
        setAuthStateCookie(response, 60 * 60);

        return response;
      }

      // Avoid leaking which one (user vs password) was wrong.
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const { user } = result;
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = signSessionToken({ email, verified: true });

    const response = NextResponse.json({
      success: true,
      redirect: "/dashboard",
      user: {
        email: user.email ?? email,
        name: user.name ?? "User",
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_MAX_AGE,
    });
    setAuthStateCookie(response, SESSION_MAX_AGE);

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to login";
    // eslint-disable-next-line no-console
    console.error("[login]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
