/**
 * Extract plain text from PDF buffer — serverless-safe.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    // pdf-parse is CJS; dynamic import for Next.js compatibility
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return (data.text ?? "").trim();
  } catch (err) {
    console.error("[pdf-parser] extraction failed:", err);
    return "";
  }
}

export function sanitizePdfText(text: string, maxLen = 12000): string {
  return text
    .replace(/\0/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
}
