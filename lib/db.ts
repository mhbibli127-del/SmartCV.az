import fs from "fs";
import path from "path";

const LOCAL_DB_PATH = path.join(process.cwd(), "data", "otp_db.json");

export interface LocalOtp {
  email: string;
  code: string;
  expiresAt: string;
}

/** Local JSON store for OTP codes (used alongside MongoDB for auth). */
export function getLocalDb(): LocalOtp[] {
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    return [];
  }
  try {
    const data = fs.readFileSync(LOCAL_DB_PATH, "utf-8");
    return JSON.parse(data) as LocalOtp[];
  } catch {
    return [];
  }
}

export function saveLocalDb(otps: LocalOtp[]): void {
  fs.mkdirSync(path.dirname(LOCAL_DB_PATH), { recursive: true });
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(otps, null, 2), "utf-8");
}
