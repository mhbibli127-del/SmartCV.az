import prisma from "@/lib/prisma";
import { getLocalDb, saveLocalDb, type LocalOtp } from "@/lib/db";

const OTP_TTL_MS = 5 * 60_000;

export function otpExpiresAt(): Date {
  return new Date(Date.now() + OTP_TTL_MS);
}

async function saveOtpPrisma(email: string, code: string, expiresAt: Date): Promise<boolean> {
  try {
    const normalized = email.toLowerCase().trim();
    await prisma.emailOtp.deleteMany({ where: { email: normalized } });
    await prisma.emailOtp.create({
      data: { email: normalized, code, expiresAt },
    });
    return true;
  } catch (err) {
    console.error("[otp-store] Prisma save failed:", err);
    return false;
  }
}

function saveOtpFile(email: string, code: string, expiresAt: Date): void {
  const normalized = email.toLowerCase().trim();
  const otps = getLocalDb().filter((o) => o.email !== normalized);
  const row: LocalOtp = {
    email: normalized,
    code,
    expiresAt: expiresAt.toISOString(),
  };
  saveLocalDb([...otps, row]);
}

/** Persist OTP — prefers PostgreSQL; falls back to local JSON on dev. */
export async function saveOtp(email: string, code: string): Promise<void> {
  const expiresAt = otpExpiresAt();
  const prismaOk = await saveOtpPrisma(email, code, expiresAt);
  if (!prismaOk) {
    try {
      saveOtpFile(email, code, expiresAt);
    } catch (err) {
      console.error("[otp-store] File save failed:", err);
      throw new Error("Could not store OTP");
    }
  }
}

async function verifyOtpPrisma(email: string, code: string): Promise<boolean> {
  try {
    const normalized = email.toLowerCase().trim();
    const record = await prisma.emailOtp.findFirst({
      where: { email: normalized, code: String(code).trim() },
      orderBy: { createdAt: "desc" },
    });
    if (!record) return false;
    if (record.expiresAt < new Date()) {
      await prisma.emailOtp.deleteMany({ where: { email: normalized } });
      return false;
    }
    await prisma.emailOtp.deleteMany({ where: { email: normalized } });
    return true;
  } catch (err) {
    console.error("[otp-store] Prisma verify failed:", err);
    return false;
  }
}

function verifyOtpFile(email: string, code: string): boolean {
  const normalized = email.toLowerCase().trim();
  const otps = getLocalDb();
  const record = otps.find(
    (o) => o.email === normalized && o.code === String(code).trim()
  );
  if (!record) return false;
  if (new Date(record.expiresAt) < new Date()) {
    saveLocalDb(otps.filter((o) => o.email !== normalized));
    return false;
  }
  saveLocalDb(otps.filter((o) => o.email !== normalized));
  return true;
}

/** Verify OTP and consume it. */
export async function verifyAndConsumeOtp(
  email: string,
  code: string
): Promise<boolean> {
  const prismaOk = await verifyOtpPrisma(email, code);
  if (prismaOk) return true;
  return verifyOtpFile(email, code);
}
