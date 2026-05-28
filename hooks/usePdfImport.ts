"use client";

import { useCallback, useState } from "react";
import { uploadPdfForImport } from "@/lib/pdf/client-upload";
import type { PdfImportPayload } from "@/types/pdf-import";

interface UsePdfImportOptions {
  onSuccess?: (data: PdfImportPayload) => void;
  onError?: (message: string, code?: string) => void;
}

export function usePdfImport(options: UsePdfImportOptions = {}) {
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { onSuccess, onError } = options;

  const importPdf = useCallback(
    async (file: File): Promise<PdfImportPayload | null> => {
      setIsImporting(true);
      setError(null);

      try {
        const result = await uploadPdfForImport(file);
        if (!result.ok) {
          const message = result.error || "Could not import PDF.";
          setError(message);
          onError?.(message, result.code);
          return null;
        }

        if (result.data.partial && result.data.message) {
          onError?.(result.data.message, "PARTIAL_IMPORT");
        }

        onSuccess?.(result.data);
        return result.data;
      } catch {
        const message = "Network error while uploading PDF.";
        setError(message);
        onError?.(message);
        return null;
      } finally {
        setIsImporting(false);
      }
    },
    [onSuccess, onError]
  );

  return { importPdf, isImporting, error, clearError: () => setError(null) };
}
