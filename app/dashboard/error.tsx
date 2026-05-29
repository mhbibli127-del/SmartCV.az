"use client";

import { useEffect } from "react";
import Link from "next/link";
import { FileWarning, RefreshCw } from "lucide-react";
import { captureExceptionSafe } from "@/lib/sentry/safe-capture";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureExceptionSafe(error);
    console.error("[dashboard/error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
          <FileWarning className="h-6 w-6" />
        </div>
        <h1 className="text-lg font-semibold text-zinc-900">Dashboard unavailable</h1>
        <p className="mt-2 text-sm text-zinc-500">
          A temporary issue prevented this view from loading. Please try again.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
          <Link
            href="/dashboard/templates"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Browse templates
          </Link>
        </div>
      </div>
    </div>
  );
}
