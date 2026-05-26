import type { UploadApiOptions, UploadApiResponse } from "cloudinary";
import { ensureCloudinaryConfigured } from "@/lib/cloudinary";
import {
  CLOUDINARY_ROOT_FOLDER,
  MEDIA_CONTEXT_FOLDERS,
  MEDIA_TRANSFORM_PRESETS,
} from "@/lib/media/cloudinary/constants";
import { buildOptimizedUrl } from "@/lib/media/cloudinary/optimize";
import { sanitizeUserFolderSegment } from "@/lib/media/validation";
import type { MediaContext, MediaUploadResult } from "@/types/media";

export interface UploadImageOptions {
  buffer: Buffer;
  context: MediaContext;
  userId: string;
  filename?: string;
  cvId?: string;
  tags?: string[];
}

function buildFolder(context: MediaContext, userId: string, cvId?: string): string {
  const segment = sanitizeUserFolderSegment(userId);
  const sub = MEDIA_CONTEXT_FOLDERS[context];

  if (context === "resume" && cvId) {
    const cvSegment = cvId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 48);
    return `${CLOUDINARY_ROOT_FOLDER}/${sub}/${segment}/${cvSegment}`;
  }

  if (context === "template-preview") {
    return `${CLOUDINARY_ROOT_FOLDER}/${sub}`;
  }

  return `${CLOUDINARY_ROOT_FOLDER}/${sub}/${segment}`;
}

function toUploadResult(
  response: UploadApiResponse,
  context: MediaContext
): MediaUploadResult {
  const secureUrl = response.secure_url;
  return {
    publicId: response.public_id,
    url: response.url,
    secureUrl,
    width: response.width,
    height: response.height,
    format: response.format,
    bytes: response.bytes,
    context,
    optimizedUrl: buildOptimizedUrl(response.public_id, context),
  };
}

export async function uploadImageBuffer(
  options: UploadImageOptions
): Promise<MediaUploadResult> {
  const cloudinary = ensureCloudinaryConfigured();
  const preset = MEDIA_TRANSFORM_PRESETS[options.context];
  const folder = buildFolder(options.context, options.userId, options.cvId);

  const uploadOptions: UploadApiOptions = {
    folder,
    resource_type: "image",
    overwrite: options.context === "avatar",
    invalidate: true,
    unique_filename: options.context !== "avatar",
    use_filename: Boolean(options.filename),
    filename_override: options.filename
      ? options.filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80)
      : undefined,
    tags: [
      "smartcv",
      options.context,
      sanitizeUserFolderSegment(options.userId),
      ...(options.tags ?? []),
    ],
    transformation: [
      {
        ...(preset.width ? { width: preset.width } : {}),
        ...(preset.height ? { height: preset.height } : {}),
        ...(preset.crop ? { crop: preset.crop } : {}),
        quality: preset.quality ?? "auto",
        fetch_format: "auto",
      },
    ],
  };

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed."));
          return;
        }
        resolve(toUploadResult(result, options.context));
      }
    );
    stream.end(options.buffer);
  });
}

export async function uploadImageFile(
  file: File,
  options: Omit<UploadImageOptions, "buffer" | "filename"> & { filename?: string }
): Promise<MediaUploadResult> {
  const bytes = await file.arrayBuffer();
  return uploadImageBuffer({
    ...options,
    buffer: Buffer.from(bytes),
    filename: options.filename ?? file.name,
  });
}
