import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export interface CanvasCaptureResult {
  thumbnailDataUrl: string;
  pdfBase64: string;
}

export async function captureCanvasForSave(
  element: HTMLElement
): Promise<CanvasCaptureResult> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
  });

  const thumbnailDataUrl = canvas.toDataURL("image/png");
  const imgData = thumbnailDataUrl;

  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
  const w = canvas.width * ratio;
  const h = canvas.height * ratio;
  const x = (pageWidth - w) / 2;
  const y = (pageHeight - h) / 2;

  pdf.addImage(imgData, "PNG", x, y, w, h);
  const pdfBase64 = pdf.output("datauristring").split(",")[1] ?? "";

  return { thumbnailDataUrl, pdfBase64 };
}
