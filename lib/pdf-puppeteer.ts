import { buildPdfHtml } from "@/lib/pdf-html-renderer";

export async function generatePdfBuffer(
  cvData: unknown,
  accentColor = "#18181b"
): Promise<{ buffer: Buffer; fileName: string }> {
  const html = buildPdfHtml(cvData, accentColor);
  const normalized = cvData as Record<string, unknown>;
  const name =
    (normalized.fullName as string) ||
    ((normalized.content as Record<string, unknown>)?.sections
      ? undefined
      : undefined) ||
    "resume";
  const fileName = `${String(name).replace(/\s+/g, "_").slice(0, 40) || "resume"}.pdf`;

  const isServerless =
    process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME;

  if (isServerless) {
    const puppeteer = await import("puppeteer-core");
    const chromium = await import("@sparticuz/chromium");

    const browser = await puppeteer.default.launch({
      args: chromium.default.args,
      defaultViewport: { width: 794, height: 1123 },
      executablePath: await chromium.default.executablePath(),
      headless: true,
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "load" });
      const buffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "0", right: "0", bottom: "0", left: "0" },
      });
      return { buffer: Buffer.from(buffer), fileName };
    } finally {
      await browser.close();
    }
  }

  try {
    const puppeteer = await import("puppeteer-core");
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "load" });
      const buffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "0", right: "0", bottom: "0", left: "0" },
      });
      return { buffer: Buffer.from(buffer), fileName };
    } finally {
      await browser.close();
    }
  } catch {
    const { generatePDF } = await import("@/lib/pdfGenerator");
    const flat = (await import("@/lib/cv-normalizer")).normalizeForExport(cvData, accentColor);
    const { pdfBase64, fileName: fn } = generatePDF(flat as Parameters<typeof generatePDF>[0], accentColor);
    return { buffer: Buffer.from(pdfBase64, "base64"), fileName: fn };
  }
}
