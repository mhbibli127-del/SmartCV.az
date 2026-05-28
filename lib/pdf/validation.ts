import {
  PDF_ALLOWED_EXTENSIONS,
  PDF_ALLOWED_MIME_TYPES,
  PDF_MAX_BYTES,
} from "@/lib/pdf/constants";

export interface PdfValidationResult {
  ok: true;
  mimeType: string;
  size: number;
}

export interface PdfValidationError {
  ok: false;
  error: string;
  code: "EMPTY_FILE" | "FILE_TOO_LARGE" | "INVALID_TYPE" | "INVALID_PDF";
}

export type ValidatePdfResult = PdfValidationResult | PdfValidationError;

function extensionOf(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

/** Check PDF magic header (%PDF). */
export function isPdfMagic(buffer: ArrayBuffer | Buffer | Uint8Array): boolean {
  const view =
    buffer instanceof Buffer
      ? buffer
      : buffer instanceof Uint8Array
        ? buffer
        : new Uint8Array(buffer);
  if (view.length < 4) return false;
  return view[0] === 0x25 && view[1] === 0x50 && view[2] === 0x44 && view[3] === 0x46;
}

function looksLikePdf(
  file: Pick<File, "type" | "name">,
  buffer?: ArrayBuffer | Buffer
): boolean {
  const ext = extensionOf(file.name);
  const mime = (file.type || "").toLowerCase();

  const mimeOk = PDF_ALLOWED_MIME_TYPES.has(mime);
  const extOk = PDF_ALLOWED_EXTENSIONS.has(ext);

  if (mime === "application/pdf" || mime === "application/x-pdf") return true;
  if (extOk && (mimeOk || mime === "")) {
    if (buffer) return isPdfMagic(buffer);
    return true;
  }
  return false;
}

export function validatePdfFile(
  file: Pick<File, "type" | "size" | "name">,
  buffer?: ArrayBuffer
): ValidatePdfResult {
  if (file.size <= 0) {
    return { ok: false, error: "File is empty.", code: "EMPTY_FILE" };
  }
  if (file.size > PDF_MAX_BYTES) {
    const mb = Math.round(PDF_MAX_BYTES / (1024 * 1024));
    return {
      ok: false,
      error: `PDF must be ${mb}MB or smaller.`,
      code: "FILE_TOO_LARGE",
    };
  }

  if (!looksLikePdf(file, buffer)) {
    return {
      ok: false,
      error: "Please upload a valid PDF file (.pdf).",
      code: "INVALID_TYPE",
    };
  }

  if (buffer && !isPdfMagic(buffer)) {
    return {
      ok: false,
      error: "File does not appear to be a valid PDF.",
      code: "INVALID_PDF",
    };
  }

  const ext = extensionOf(file.name);
  const mime = (file.type || "").toLowerCase();
  return {
    ok: true,
    mimeType: mime || "application/pdf",
    size: file.size,
  };
}

export function validatePdfBuffer(
  buffer: Buffer,
  filename = "upload.pdf"
): ValidatePdfResult {
  if (buffer.length <= 0) {
    return { ok: false, error: "File is empty.", code: "EMPTY_FILE" };
  }
  if (buffer.length > PDF_MAX_BYTES) {
    const mb = Math.round(PDF_MAX_BYTES / (1024 * 1024));
    return {
      ok: false,
      error: `PDF must be ${mb}MB or smaller.`,
      code: "FILE_TOO_LARGE",
    };
  }
  if (!isPdfMagic(buffer)) {
    return {
      ok: false,
      error: "File does not appear to be a valid PDF.",
      code: "INVALID_PDF",
    };
  }

  return {
    ok: true,
    mimeType: "application/pdf",
    size: buffer.length,
  };
}
