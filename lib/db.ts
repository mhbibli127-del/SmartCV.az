import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { getMongoUri } from "@/lib/env";

const LOCAL_DB_PATH = path.join(process.cwd(), "data", "otp_db.json");

export interface LocalOtp {
  email: string;
  code: string;
  expiresAt: string; // ISO string
}

// Local JSON Database Helpers
export function getLocalDb(): LocalOtp[] {
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    return [];
  }
  try {
    const data = fs.readFileSync(LOCAL_DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

export function saveLocalDb(otps: LocalOtp[]): void {
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(otps, null, 2), "utf-8");
}

export async function connectToDatabase() {
  const MONGODB_URI = getMongoUri();
  if (!MONGODB_URI) {
    return { isLocal: true };
  }

  if (mongoose.connection.readyState >= 1) {
    return { isLocal: false };
  }

  try {
    await mongoose.connect(MONGODB_URI);
    return { isLocal: false };
  } catch (error) {
    console.warn(
      "[mongodb] Connection failed, falling back to local JSON database.",
      error
    );
    return { isLocal: true };
  }
}
