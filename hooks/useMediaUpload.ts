"use client";

import { useCallback, useState } from "react";
import { uploadMediaFile } from "@/lib/media/client-upload";
import type { MediaContext, MediaUploadResult } from "@/types/media";

export interface UseMediaUploadOptions {
  context: MediaContext;
  cvId?: string;
  onSuccess?: (result: MediaUploadResult) => void;
  onError?: (message: string) => void;
}

export function useMediaUpload(options: UseMediaUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<MediaUploadResult | null>(null);

  const upload = useCallback(
    async (file: File): Promise<MediaUploadResult | null> => {
      setIsUploading(true);
      setError(null);

      try {
        const result = await uploadMediaFile({
          file,
          context: options.context,
          cvId: options.cvId,
        });

        if (!result.success || !result.media) {
          const message = result.error ?? "Upload failed.";
          setError(message);
          options.onError?.(message);
          return null;
        }

        setLastResult(result.media);
        options.onSuccess?.(result.media);
        return result.media;
      } catch {
        const message = "Network error during upload.";
        setError(message);
        options.onError?.(message);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setError(null);
    setLastResult(null);
  }, []);

  return { upload, isUploading, error, lastResult, reset };
}
