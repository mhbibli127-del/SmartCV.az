import jwt from "jsonwebtoken";
import { getJwtSecret } from "@/lib/env";

export type AccessTokenPayload = {
  userId: string;
  email: string;
};

export function createAccessToken(payload: AccessTokenPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as AccessTokenPayload;
  } catch {
    return null;
  }
}

