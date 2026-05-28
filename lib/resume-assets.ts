import fs from "fs/promises";
import path from "path";
import { isVercel } from "@/lib/build";
import { ensureCloudinaryConfigured } from "@/lib/cloudinary";
import { isCloudinaryConfigured } from "@/lib/env";

const THUMBNAIL_DIR = path.join(process.cwd(), "public", "resumes", "thumbnails");
const PDF_DIR = path.join(process.cwd(), "public", "resumes", "pdfs");
const CLOUDINARY_FOLDER = "smartcv/resumes/exports";

function stripDataUrlPrefix(dataUrl: string): string {
  const match = dataUrl.match(/^data:[^;]+;base64,(.+)$/);
  return match ? match[1] : dataUrl;
}

export async function ensureResumeAssetDirs(): Promise<void> {
  if (isVercel()) return;
  await fs.mkdir(THUMBNAIL_DIR, { recursive: true });
  await fs.mkdir(PDF_DIR, { recursive: true });
}

async function uploadToCloudinary(
  buffer: Buffer,
  filename: string,
  resourceType: "image" | "raw"
): Promise<string> {
  const cloudinary = ensureCloudinaryConfigured();
  const publicId = filename.replace(/\.[^.]+$/, "");

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: CLOUDINARY_FOLDER,
        public_id: publicId,
        resource_type: resourceType,
        overwrite: true,
        invalidate: true,
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

async function persistAsset(
  buffer: Buffer,
  localRelativeUrl: string,
  localFilename: string,
  localDir: string,
  resourceType: "image" | "raw"
): Promise<string> {
  if (isVercel() && isCloudinaryConfigured()) {
    return uploadToCloudinary(buffer, localFilename, resourceType);
  }

  await ensureResumeAssetDirs();
  await fs.writeFile(path.join(localDir, localFilename), buffer);
  return localRelativeUrl;
}

export interface SavedResumeAssets {
  thumbnailUrl: string;
  pdfUrl: string;
  stamp: string;
}

/** Save published export assets as resume-[timestamp].{png,pdf} */
export async function savePublishedResumeAssets(
  thumbnailDataUrl: string,
  pdfBase64: string
): Promise<SavedResumeAssets> {
  const stamp = String(Date.now());
  const thumbFile = `resume-${stamp}.png`;
  const pdfFile = `resume-${stamp}.pdf`;

  const thumbBuffer = Buffer.from(stripDataUrlPrefix(thumbnailDataUrl), "base64");
  const pdfBuffer = Buffer.from(stripDataUrlPrefix(pdfBase64), "base64");

  const thumbnailUrl = await persistAsset(
    thumbBuffer,
    `/resumes/thumbnails/${thumbFile}`,
    thumbFile,
    THUMBNAIL_DIR,
    "image"
  );
  const pdfUrl = await persistAsset(
    pdfBuffer,
    `/resumes/pdfs/${pdfFile}`,
    pdfFile,
    PDF_DIR,
    "raw"
  );

  return { thumbnailUrl, pdfUrl, stamp };
}

export async function saveResumeThumbnail(
  resumeId: string,
  dataUrl: string
): Promise<string> {
  const buffer = Buffer.from(stripDataUrlPrefix(dataUrl), "base64");
  const filename = `${resumeId}.png`;
  return persistAsset(
    buffer,
    `/resumes/thumbnails/${filename}`,
    filename,
    THUMBNAIL_DIR,
    "image"
  );
}

export async function saveResumePdf(resumeId: string, pdfBase64: string): Promise<string> {
  const buffer = Buffer.from(stripDataUrlPrefix(pdfBase64), "base64");
  const filename = `${resumeId}.pdf`;
  return persistAsset(buffer, `/resumes/pdfs/${filename}`, filename, PDF_DIR, "raw");
}

export async function deleteResumeAssets(resumeId: string): Promise<void> {
  if (isVercel()) return;
  const thumb = path.join(THUMBNAIL_DIR, `${resumeId}.png`);
  const pdf = path.join(PDF_DIR, `${resumeId}.pdf`);
  await Promise.all([
    fs.unlink(thumb).catch(() => {}),
    fs.unlink(pdf).catch(() => {}),
  ]);
}
