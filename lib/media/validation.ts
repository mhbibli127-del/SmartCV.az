import {
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_IMAGE_MIME_TYPES,
  MEDIA_SIZE_LIMITS,
} from "@/lib/media/cloudinary/constants";
import type { MediaContext } from "@/types/media";

export interface FileValidationResult {
  ok: true;
  mimeType: string;
  size: number;
}

export interface FileValidationError {
  ok: false;
  error: string;
  code: string;
}

export type ValidateFileResult = FileValidationResult | FileValidationError;

function extensionOf(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

export function validateImageFile(
  file: Pick<File, "type" | "size" | "name">,
  context: MediaContext
): ValidateFileResult {
  const maxSize = MEDIA_SIZE_LIMITS[context];
  if (file.size <= 0) {
    return { ok: false, error: "File is empty.", code: "EMPTY_FILE" };
  }
  if (file.size > maxSize) {
    const mb = Math.round(maxSize / (1024 * 1024));
    return {
      ok: false,
      error: `File exceeds ${mb}MB limit for ${context} uploads.`,
      code: "FILE_TOO_LARGE",
    };
  }

  const ext = extensionOf(file.name);
  const mime = file.type.toLowerCase();

  if (!ALLOWED_IMAGE_MIME_TYPES.has(mime) && !ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
    return {
      ok: false,
      error: "Only JPG, PNG, WebP, and GIF images are allowed.",
      code: "INVALID_TYPE",
    };
  }

  return { ok: true, mimeType: mime || `image/${ext === "jpg" ? "jpeg" : ext}`, size: file.size };
}

export function sanitizeUserFolderSegment(userId: string): string {
  return userId
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9@._-]/g, "_")
    .slice(0, 64);
}
