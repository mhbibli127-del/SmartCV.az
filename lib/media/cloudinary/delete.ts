import { ensureCloudinaryConfigured } from "@/lib/cloudinary";
import { CLOUDINARY_ROOT_FOLDER } from "@/lib/media/cloudinary/constants";
import { sanitizeUserFolderSegment } from "@/lib/media/validation";
import type { MediaDeleteResult } from "@/types/media";

export async function deleteCloudinaryAsset(
  publicId: string
): Promise<MediaDeleteResult> {
  const cloudinary = ensureCloudinaryConfigured();
  const result = await cloudinary.uploader.destroy(publicId, {
    invalidate: true,
    resource_type: "image",
  });

  return { publicId, result: result.result };
}

/**
 * Ensures a user can only delete assets under their own folder prefix.
 */
export function assertUserOwnsAsset(publicId: string, userId: string): boolean {
  const segment = sanitizeUserFolderSegment(userId);
  const normalized = publicId.toLowerCase();
  const allowedPrefixes = [
    `${CLOUDINARY_ROOT_FOLDER}/avatars/${segment}`,
    `${CLOUDINARY_ROOT_FOLDER}/resumes/${segment}`,
    `${CLOUDINARY_ROOT_FOLDER}/portfolio/${segment}`,
    `${CLOUDINARY_ROOT_FOLDER}/exports/${segment}`,
  ];
  return allowedPrefixes.some((prefix) => normalized.startsWith(prefix));
}
