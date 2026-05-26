export { uploadMediaFile, deleteMediaAsset } from "@/lib/media/client-upload";
export type { ClientUploadOptions, ClientUploadResponse } from "@/lib/media/client-upload";

export {
  buildOptimizedUrl,
  buildThumbnailUrl,
  buildAvatarUrl,
  buildResumeImageUrl,
  buildExportUrl,
  isCloudinaryUrl,
  extractPublicIdFromUrl,
} from "@/lib/media/cloudinary/optimize";

export type { MediaContext, MediaUploadResult } from "@/types/media";
