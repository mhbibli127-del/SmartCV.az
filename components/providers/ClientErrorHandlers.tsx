"use client";

import { useEffect } from "react";
import { captureExceptionSafe } from "@/lib/sentry/safe-capture";

/** Logs client-side unhandled rejections instead of failing silently. */
export function ClientErrorHandlers() {
  useEffect(() => {
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("[unhandledrejection]", event.reason);
      captureExceptionSafe(event.reason);
    };

    const onWindowError = (event: ErrorEvent) => {
      console.error("[window.error]", event.error ?? event.message);
      captureExceptionSafe(event.error ?? event.message);
    };

    window.addEventListener("unhandledrejection", onUnhandledRejection);
    window.addEventListener("error", onWindowError);

    return () => {
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
      window.removeEventListener("error", onWindowError);
    };
  }, []);

  return null;
}
