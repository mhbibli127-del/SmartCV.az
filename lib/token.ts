import jwt from "jsonwebtoken";
import { getJwtSecret } from "@/lib/env";

export function verifySessionToken(token: string) {
  try {
    return jwt.verify(token, getJwtSecret()) as {
      email: string;
      verified: boolean;
    };
  } catch {
    return null;
  }
}

export function signSessionToken(payload: { email: string; verified: boolean }) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}
