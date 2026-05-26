import type { MediaContext } from "@/types/media";

export const CLOUDINARY_ROOT_FOLDER = "smartcv";

/** Max upload size per context (bytes) */
export const MEDIA_SIZE_LIMITS: Record<MediaContext, number> = {
  avatar: 2 * 1024 * 1024,
  resume: 5 * 1024 * 1024,
  portfolio: 5 * 1024 * 1024,
  "template-preview": 3 * 1024 * 1024,
  export: 10 * 1024 * 1024,
};

export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const ALLOWED_IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
]);

export const MEDIA_CONTEXT_FOLDERS: Record<MediaContext, string> = {
  avatar: "avatars",
  resume: "resumes",
  portfolio: "portfolio",
  "template-preview": "templates/previews",
  export: "exports",
};

/** Default Cloudinary transformations per context */
export const MEDIA_TRANSFORM_PRESETS: Record<
  MediaContext,
  { width?: number; height?: number; crop?: string; quality?: string }
> = {
  avatar: { width: 512, height: 512, crop: "fill", quality: "auto" },
  resume: { width: 1600, quality: "auto" },
  portfolio: { width: 1920, quality: "auto" },
  "template-preview": { width: 1200, quality: "auto" },
  export: { quality: "auto:best" },
};
