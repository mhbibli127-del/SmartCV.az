import type { MediaContext, MediaUploadResult } from "@/types/media";

export interface ClientUploadOptions {
  file: File;
  context: MediaContext;
  cvId?: string;
  signal?: AbortSignal;
}

export interface ClientUploadResponse {
  success: boolean;
  media?: MediaUploadResult;
  error?: string;
  code?: string;
}

/**
 * Upload an image to Cloudinary via the secure server API route.
 * Safe to import from client components — no secrets exposed.
 */
export async function uploadMediaFile(
  options: ClientUploadOptions
): Promise<ClientUploadResponse> {
  const formData = new FormData();
  formData.append("file", options.file);
  formData.append("context", options.context);
  if (options.cvId) {
    formData.append("cvId", options.cvId);
  }

  const response = await fetch("/api/v1/media/upload", {
    method: "POST",
    body: formData,
    credentials: "include",
    signal: options.signal,
  });

  const data = (await response.json()) as ClientUploadResponse & {
    media?: MediaUploadResult;
  };

  if (!response.ok) {
    return {
      success: false,
      error: data.error ?? "Upload failed.",
      code: data.code,
    };
  }

  return { success: true, media: data.media };
}

export async function deleteMediaAsset(publicId: string): Promise<boolean> {
  const response = await fetch("/api/v1/media/delete", {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicId }),
  });
  return response.ok;
}
