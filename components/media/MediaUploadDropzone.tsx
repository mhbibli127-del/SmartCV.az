"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import type { MediaContext, MediaUploadResult } from "@/types/media";

interface MediaUploadDropzoneProps {
  context: MediaContext;
  cvId?: string;
  accept?: string;
  label?: string;
  hint?: string;
  className?: string;
  compact?: boolean;
  onUploaded: (result: MediaUploadResult) => void;
  onError?: (message: string) => void;
}

export default function MediaUploadDropzone({
  context,
  cvId,
  accept = "image/jpeg,image/png,image/webp,image/gif",
  label = "Drop image or click to upload",
  hint,
  className,
  compact = false,
  onUploaded,
  onError,
}: MediaUploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const { upload, isUploading, error } = useMediaUpload({
    context,
    cvId,
    onSuccess: onUploaded,
    onError,
  });

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      await upload(file);
    },
    [upload]
  );

  return (
    <div className={cn("space-y-2", className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => !isUploading && inputRef.current?.click()}
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
          if (!isUploading) void handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed transition",
          compact ? "px-3 py-4" : "px-4 py-6",
          dragOver
            ? "border-zinc-900 bg-zinc-50"
            : "border-zinc-300 bg-white hover:border-zinc-400 hover:bg-zinc-50/80",
          isUploading && "pointer-events-none opacity-60"
        )}
      >
        {isUploading ? (
          <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
        ) : (
          <Upload className="h-5 w-5 text-zinc-500" />
        )}
        <p className={cn("mt-2 text-center font-medium text-zinc-700", compact ? "text-xs" : "text-sm")}>
          {isUploading ? "Uploading…" : label}
        </p>
        {hint && !isUploading && (
          <p className="mt-1 text-center text-xs text-zinc-500">{hint}</p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          disabled={isUploading}
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
