import type { ExportRequest, ExportResult } from "@/types/enterprise";
import { enqueueJob, getJobQueue } from "@/lib/enterprise/queue/job-queue";

/**
 * Export engine — routes heavy exports to queue, light exports inline.
 */
export async function requestExport(req: ExportRequest): Promise<ExportResult> {
  const exportId = `exp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  if (req.format === "pdf" || req.format === "docx") {
    await enqueueJob("pdf-export", {
      exportId,
      ...req,
    });
    return { exportId, status: "pending" };
  }

  return { exportId, status: "processing" };
}

/** Register export worker — call once at app startup. */
export function registerExportWorker(): void {
  getJobQueue().register("pdf-export", async (job) => {
    const payload = job.payload as ExportRequest & { exportId: string };
    // Delegates to existing Puppeteer pipeline
    const { generatePdfBuffer } = await import("@/lib/pdf-puppeteer");
    await generatePdfBuffer(payload);
    console.info(`[export-engine] Completed export ${payload.exportId}`);
  });
}

export const SUPPORTED_FORMATS = ["pdf", "png", "docx", "html"] as const;
