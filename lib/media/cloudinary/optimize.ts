import {
  CLOUDINARY_ROOT_FOLDER,
  MEDIA_TRANSFORM_PRESETS,
} from "@/lib/media/cloudinary/constants";
import { getPublicCloudinaryCloudName } from "@/lib/env";
import type { MediaContext } from "@/types/media";

type TransformOptions = {
  width?: number;
  height?: number;
  crop?: string;
  quality?: string;
  format?: string;
};

function buildTransformSegment(opts: TransformOptions): string {
  const parts: string[] = [];
  if (opts.width) parts.push(`w_${opts.width}`);
  if (opts.height) parts.push(`h_${opts.height}`);
  if (opts.crop) parts.push(`c_${opts.crop}`);
  if (opts.quality) parts.push(`q_${opts.quality}`);
  if (opts.format) parts.push(`f_${opts.format}`);
  return parts.join(",");
}

/**
 * Build a CDN URL with context-aware optimization (no SDK required).
 */
export function buildOptimizedUrl(
  publicId: string,
  context: MediaContext,
  overrides?: TransformOptions
): string {
  const cloudName = getPublicCloudinaryCloudName();
  if (!cloudName) {
    return "";
  }

  const preset = MEDIA_TRANSFORM_PRESETS[context];
  const transform = buildTransformSegment({
    width: overrides?.width ?? preset.width,
    height: overrides?.height ?? preset.height,
    crop: overrides?.crop ?? preset.crop,
    quality: overrides?.quality ?? preset.quality ?? "auto",
    format: overrides?.format ?? "auto",
  });

  const encodedId = publicId.split("/").map(encodeURIComponent).join("/");
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transform}/${encodedId}`;
}

/** Thumbnail for template gallery / previews */
export function buildThumbnailUrl(publicId: string, width = 400): string {
  return buildOptimizedUrl(publicId, "template-preview", { width, crop: "fill" });
}

/** Avatar circle crop at fixed size */
export function buildAvatarUrl(publicId: string, size = 256): string {
  return buildOptimizedUrl(publicId, "avatar", {
    width: size,
    height: size,
    crop: "fill",
  });
}

/** Resume / portfolio hero image */
export function buildResumeImageUrl(publicId: string, width = 1200): string {
  return buildOptimizedUrl(publicId, "resume", { width });
}

/** Export-quality asset URL */
export function buildExportUrl(publicId: string): string {
  return buildOptimizedUrl(publicId, "export", { quality: "auto:best" });
}

export function isCloudinaryUrl(url: string): boolean {
  return url.includes("res.cloudinary.com/") || url.includes(`/${CLOUDINARY_ROOT_FOLDER}/`);
}

export function extractPublicIdFromUrl(url: string): string | null {
  if (!isCloudinaryUrl(url)) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?(?:\?|$)/i);
  if (!match?.[1]) return null;
  return decodeURIComponent(match[1].replace(/\.[a-zA-Z0-9]+$/, ""));
}
