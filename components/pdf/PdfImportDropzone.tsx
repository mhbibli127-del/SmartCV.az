"use client";

import { useCallback, useRef, useState } from "react";
import { FileUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PDF_MAX_BYTES } from "@/lib/pdf/constants";
import { validatePdfFile } from "@/lib/pdf/validation";
import { usePdfImport } from "@/hooks/usePdfImport";
import type { PdfImportPayload } from "@/types/pdf-import";

interface PdfImportDropzoneProps {
  label?: string;
  hint?: string;
  className?: string;
  compact?: boolean;
  onImported: (data: PdfImportPayload) => void;
  onError?: (message: string) => void;
}

const MAX_MB = Math.round(PDF_MAX_BYTES / (1024 * 1024));

export function PdfImportDropzone({
  label = "Drop your CV PDF or click to upload",
  hint = `PDF only · max ${MAX_MB}MB · text-based files work best`,
  className,
  compact = false,
  onImported,
  onError,
}: PdfImportDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { importPdf, isImporting } = usePdfImport({
    onSuccess: (data) => {
      if (data.success || data.fullName || data.rawExperience || data.summary) {
        onImported(data);
      } else if (data.message) {
        onError?.(data.message);
        onImported(data);
      }
    },
    onError: (message) => {
      setLocalError(message);
      onError?.(message);
    },
  });

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      setLocalError(null);

      const header = await file.slice(0, 4).arrayBuffer();
      const validation = validatePdfFile(file, header);
      if (!validation.ok) {
        setLocalError(validation.error);
        onError?.(validation.error);
        return;
      }

      await importPdf(file);
    },
    [importPdf, onError]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      void handleFile(files?.[0]);
    },
    [handleFile]
  );

  const busy = isImporting;

  return (
    <div className={cn("space-y-2", className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => !busy && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!busy) void handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed transition",
          compact ? "px-3 py-4" : "px-4 py-6",
          dragOver
            ? "border-zinc-900 bg-zinc-50"
            : "border-zinc-300 bg-white hover:border-zinc-400 hover:bg-zinc-50/80",
          busy && "pointer-events-none opacity-60"
        )}
      >
        {busy ? (
          <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
        ) : (
          <FileUp className="h-5 w-5 text-zinc-500" />
        )}
        <p
          className={cn(
            "mt-2 text-center font-medium text-zinc-700",
            compact ? "text-xs" : "text-sm"
          )}
        >
          {busy ? "Reading your PDF…" : label}
        </p>
        {hint && !busy && (
          <p className="mt-1 text-center text-xs text-zinc-500">{hint}</p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          disabled={busy}
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>
      {localError && <p className="text-xs text-red-600">{localError}</p>}
    </div>
  );
}
