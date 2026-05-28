"use client";

import { memo, useCallback, useState } from "react";
import Image from "next/image";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { LEONARDO_PRESETS } from "@/lib/ai/leonardo/presets";
import type { LeonardoPresetId } from "@/lib/ai/leonardo/types";
import { useEditorStore } from "@/lib/editor-store";
import { cn } from "@/lib/utils";

interface AIImagePanelProps {
  cvId?: string | null;
  className?: string;
}

function AIImagePanelInner({ cvId, className }: AIImagePanelProps) {
  const [preset, setPreset] = useState<LeonardoPresetId>("avatar");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const addImageElement = useEditorStore((s) => s.addImageElement);

  const generate = useCallback(async () => {
    if (!prompt.trim()) {
      setError("Describe the image you want to generate.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/ai/image", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preset, prompt, cvId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Generation failed.");
        return;
      }

      const genId = data.generation?.generationId;
      if (!genId) {
        setError("No generation ID returned.");
        return;
      }

      const poll = await fetch(`/api/v1/ai/image/${genId}?wait=1`, {
        credentials: "include",
      });
      const pollData = await poll.json();
      const url = pollData.generation?.images?.[0]?.url;
      if (url) {
        setPreviewUrl(url);
        addImageElement(url);
      } else {
        setError("Generation timed out. Try again.");
      }
    } catch {
      setError("Network error during AI generation.");
    } finally {
      setLoading(false);
    }
  }, [prompt, preset, cvId, addImageElement]);

  const presets = Object.values(LEONARDO_PRESETS).filter((p) => p.id !== "custom");

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-violet-500" />
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Leonardo AI
        </p>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {presets.slice(0, 6).map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPreset(p.id)}
            className={cn(
              "rounded-lg border px-2 py-1.5 text-left text-[10px] transition",
              preset === p.id
                ? "border-violet-400 bg-violet-50 text-violet-900"
                : "border-zinc-200 hover:bg-zinc-50"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your AI visual…"
        rows={3}
        className="w-full resize-none rounded-lg border border-zinc-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-200"
      />
      <button
        type="button"
        disabled={loading}
        onClick={() => void generate()}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-2 text-xs font-medium text-white hover:bg-violet-700 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
        {loading ? "Generating…" : "Generate with AI"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {previewUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-zinc-200">
          <Image
            src={previewUrl}
            alt="AI generated preview"
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            unoptimized
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
}

export const AIImagePanel = memo(AIImagePanelInner);
