import { validatePdfFile } from "@/lib/pdf/validation";
import type { PdfImportPayload } from "@/types/pdf-import";

export type PdfUploadError = {
  ok: false;
  error: string;
  code?: string;
  status: number;
  data?: PdfImportPayload;
};

export type PdfUploadSuccess = {
  ok: true;
  data: PdfImportPayload;
};

export type PdfUploadResult = PdfUploadSuccess | PdfUploadError;

/** Upload a PDF resume for parsing via POST /api/upload/pdf */
export async function uploadPdfForImport(file: File): Promise<PdfUploadResult> {
  const headerSlice = file.slice(0, 4);
  const headerBuffer = await headerSlice.arrayBuffer();
  const validation = validatePdfFile(file, headerBuffer);
  if (!validation.ok) {
    return {
      ok: false,
      error: validation.error,
      code: validation.code,
      status: 400,
    };
  }

  const formData = new FormData();
  formData.append("pdf", file, file.name || "resume.pdf");

  const res = await fetch("/api/upload/pdf", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = (await res.json().catch(() => ({}))) as PdfImportPayload;

  if (!res.ok) {
    return {
      ok: false,
      error: data.error || data.message || "PDF upload failed.",
      code: data.code,
      status: res.status,
      data,
    };
  }

  return { ok: true, data };
}

/** Persist parsed CV fields for Studio import (?import=pdf). */
export function storeExtractedPdfData(data: PdfImportPayload): void {
  try {
    localStorage.setItem("extractedPdfData", JSON.stringify(data));
  } catch {
    /* quota / private mode */
  }
}
