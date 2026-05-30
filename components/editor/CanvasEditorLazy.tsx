"use client";

import { forwardRef, useEffect, useState, type ComponentType } from "react";
import { Loader2 } from "lucide-react";
import type { CanvasEditorHandle } from "@/components/editor/CanvasEditor";
import { A4_HEIGHT, A4_WIDTH } from "@/lib/layout-engine";

export type CanvasEditorLazyProps = {
  embedded?: boolean;
  zoom?: number;
  onReady?: () => void;
  loadingClassName?: string;
};

type LoadedCanvasEditor = ComponentType<
  Omit<CanvasEditorLazyProps, "loadingClassName"> & {
    ref?: React.Ref<CanvasEditorHandle>;
  }
>;

/**
 * Client-only Konva canvas with ref forwarding.
 * next/dynamic cannot forward refs — this wrapper lazy-loads safely.
 */
export const CanvasEditorLazy = forwardRef<CanvasEditorHandle, CanvasEditorLazyProps>(
  function CanvasEditorLazy({ loadingClassName, ...props }, ref) {
    const [Editor, setEditor] = useState<LoadedCanvasEditor | null>(null);

    useEffect(() => {
      void import("@/components/editor/CanvasEditor").then((m) => {
        setEditor(() => m.CanvasEditor as LoadedCanvasEditor);
      });
    }, []);

    if (!Editor) {
      return (
        <div
          className={
            loadingClassName ??
            "flex items-center justify-center bg-white"
          }
          style={{ width: A4_WIDTH, height: A4_HEIGHT }}
        >
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
        </div>
      );
    }

    return <Editor ref={ref} {...props} />;
  }
);
