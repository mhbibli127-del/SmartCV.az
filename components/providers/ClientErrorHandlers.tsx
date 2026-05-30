"use client";

import { useEffect } from "react";
import { captureExceptionSafe } from "@/lib/sentry/safe-capture";
import { isNextNavigationError } from "@/lib/next-navigation-errors";

/** Logs client-side unhandled rejections instead of failing silently. */
export function ClientErrorHandlers() {
  useEffect(() => {
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isNextNavigationError(event.reason)) return;
      console.error("[unhandledrejection]", event.reason);
      captureExceptionSafe(event.reason);
    };

    const onWindowError = (event: ErrorEvent) => {
      if (isNextNavigationError(event.error ?? event.message)) return;
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
