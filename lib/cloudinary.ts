import { v2 as cloudinary } from "cloudinary";
import {
  getCloudinaryCloudName,
  getCloudinaryApiKey,
  getCloudinaryApiSecret,
  isCloudinaryConfigured,
} from "@/lib/env";

let configured = false;

/**
 * Lazily configure Cloudinary once per process.
 * Safe to call from API routes and server utilities.
 */
export function ensureCloudinaryConfigured(): typeof cloudinary {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "[cloudinary] Missing CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET. " +
        "Set them in .env.local."
    );
  }

  if (!configured) {
    cloudinary.config({
      cloud_name: getCloudinaryCloudName()!,
      api_key: getCloudinaryApiKey()!,
      api_secret: getCloudinaryApiSecret()!,
      secure: true,
    });
    configured = true;
  }

  return cloudinary;
}

export { cloudinary };
