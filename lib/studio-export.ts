import { A4_HEIGHT, A4_WIDTH } from "@/lib/layout-engine";
import { preloadImages, waitForImages } from "@/lib/wait-for-images";

const A4_PT_WIDTH = 595.28;
const A4_PT_HEIGHT = 841.89;
const SETTLE_MS = 300;

export type KonvaPageCaptureEditor = {
  preparePage: (page: number) => Promise<void>;
  getPageCount: () => number;
  exportPng: () => string | null;
};

/** Konva stage pages — waits for images between page switches. */
export async function captureKonvaPagesFromEditor(
  editor: KonvaPageCaptureEditor,
  imageSources: string[] = []
): Promise<string[]> {
  await preloadImages(imageSources);
  await new Promise<void>((resolve) => setTimeout(resolve, SETTLE_MS));

  const pageCount = editor.getPageCount();
  const dataUrls: string[] = [];

  for (let page = 1; page <= pageCount; page += 1) {
    await editor.preparePage(page);
    await preloadImages(imageSources);
    await new Promise<void>((resolve) => setTimeout(resolve, SETTLE_MS));
    const dataUrl = editor.exportPng();
    if (!dataUrl) throw new Error("Canvas not ready");
    dataUrls.push(dataUrl);
  }

  return dataUrls;
}

/** Single active Konva page capture. */
export async function captureKonvaActivePageFromEditor(
  editor: KonvaPageCaptureEditor,
  activePage: number,
  imageSources: string[] = []
): Promise<string> {
  await editor.preparePage(activePage);
  await preloadImages(imageSources);
  await new Promise<void>((resolve) => setTimeout(resolve, SETTLE_MS));
  const dataUrl = editor.exportPng();
  if (!dataUrl) throw new Error("Canvas not ready");
  return dataUrl;
}

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

function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return fetch(dataUrl).then((res) => res.blob());
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

/** DOM capture for non-Konva editors (html2canvas). */
async function capturePaperDom(paperEl: HTMLElement, scale = 2): Promise<HTMLCanvasElement> {
  await waitForImages(paperEl, 500);
  const html2canvas = await loadHtml2Canvas();
  return html2canvas(paperEl, {
    scale,
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#ffffff",
    width: A4_WIDTH,
    height: A4_HEIGHT,
    windowWidth: A4_WIDTH,
    windowHeight: A4_HEIGHT,
    logging: false,
  });
}

/** Konva stage export — pixel-perfect, avoids html2canvas canvas taint. */
export async function exportKonvaDataUrl(
  dataUrl: string,
  format: "png" | "jpg",
  title: string
): Promise<StudioExportResult> {
  const safe = title.replace(/\s+/g, "_") || "resume";

  if (format === "png") {
    const blob = await dataUrlToBlob(dataUrl);
    return { blob, dataUrl, filename: `${safe}.png` };
  }

  const jpegDataUrl = await convertDataUrlFormat(dataUrl, "image/jpeg", 0.92);
  const blob = await dataUrlToBlob(jpegDataUrl);
  return { blob, dataUrl: jpegDataUrl, filename: `${safe}.jpg` };
}

async function convertDataUrlFormat(
  dataUrl: string,
  mime: string,
  quality?: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Export failed"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL(mime, quality));
    };
    img.onerror = () => reject(new Error("Export failed"));
    img.src = dataUrl;
  });
}

export async function exportKonvaPdf(
  dataUrls: string[],
  title: string
): Promise<StudioExportResult> {
  if (dataUrls.length === 0) throw new Error("Export target not found");

  const jsPDF = await loadJsPDF();
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
    compress: true,
  });

  let firstDataUrl = dataUrls[0]!;

  for (let i = 0; i < dataUrls.length; i += 1) {
    const dataUrl = dataUrls[i]!;
    if (i > 0) pdf.addPage();
    pdf.addImage(dataUrl, "PNG", 0, 0, A4_PT_WIDTH, A4_PT_HEIGHT, undefined, "FAST");
  }

  const blob = pdf.output("blob");
  return { blob, dataUrl: firstDataUrl, filename: `cv-${Date.now()}.pdf` };
}

export async function exportPaperImage(
  paperEl: HTMLElement,
  format: "png" | "jpg",
  title: string
): Promise<StudioExportResult> {
  const canvas = await capturePaperDom(paperEl, 2);
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
    const canvas = await capturePaperDom(paperElements[i]!, 2);
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
