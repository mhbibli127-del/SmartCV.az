import { A4_HEIGHT, A4_WIDTH } from "@/lib/layout-engine";

const A4_PT_WIDTH = 595.28;
const A4_PT_HEIGHT = 841.89;

export type StudioExportFormat = "pdf" | "png" | "jpg";

export interface StudioExportResult {
  blob: Blob;
  dataUrl: string;
  filename: string;
}

async function loadHtml2Canvas() {
  const mod = await import("html2canvas");
  return mod.default;
}

async function loadJsPDF() {
  const mod = await import("jspdf");
  return mod.jsPDF;
}

async function capturePaper(paperEl: HTMLElement, scale = 2): Promise<HTMLCanvasElement> {
  const html2canvas = await loadHtml2Canvas();
  return html2canvas(paperEl, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    width: A4_WIDTH,
    height: A4_HEIGHT,
    windowWidth: A4_WIDTH,
    windowHeight: A4_HEIGHT,
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Export failed"))),
      type,
      quality
    );
  });
}

export async function exportPaperImage(
  paperEl: HTMLElement,
  format: "png" | "jpg",
  title: string
): Promise<StudioExportResult> {
  const canvas = await capturePaper(paperEl, 2);
  const mime = format === "jpg" ? "image/jpeg" : "image/png";
  const quality = format === "jpg" ? 0.92 : undefined;
  const blob = await canvasToBlob(canvas, mime, quality);
  const dataUrl = canvas.toDataURL(mime, quality);
  const safe = title.replace(/\s+/g, "_") || "resume";
  return { blob, dataUrl, filename: `${safe}.${format}` };
}

export async function exportPaperPdf(
  paperElements: HTMLElement[],
  title: string
): Promise<StudioExportResult> {
  const jsPDF = await loadJsPDF();
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
    compress: true,
  });

  let firstDataUrl = "";

  for (let i = 0; i < paperElements.length; i += 1) {
    const canvas = await capturePaper(paperElements[i]!, 2);
    const dataUrl = canvas.toDataURL("image/png");
    if (i === 0) firstDataUrl = dataUrl;
    if (i > 0) pdf.addPage();
    pdf.addImage(dataUrl, "PNG", 0, 0, A4_PT_WIDTH, A4_PT_HEIGHT, undefined, "FAST");
  }

  const blob = pdf.output("blob");
  return { blob, dataUrl: firstDataUrl, filename: `cv-${Date.now()}.pdf` };
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
