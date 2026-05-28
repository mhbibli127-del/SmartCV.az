/** Max PDF upload size for CV import (10 MB). */
export const PDF_MAX_BYTES = 10 * 1024 * 1024;

export const PDF_ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/x-pdf",
  "application/octet-stream",
  "",
]);

export const PDF_ALLOWED_EXTENSIONS = new Set(["pdf"]);

export const PDF_FORM_FIELD_NAMES = ["pdf", "file", "document"] as const;
