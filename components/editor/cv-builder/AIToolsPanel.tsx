"use client";

import { memo, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import type { AiEditorAction } from "@/types/cv-editor";
import { useCvEditorStore } from "@/store/cv-editor-store";
import { useToast } from "@/components/ui/use-toast";

const ACTIONS: Array<{ id: AiEditorAction; label: string; description: string }> = [
  { id: "rewrite", label: "Rewrite", description: "Fresh phrasing, same meaning" },
  { id: "improve", label: "Improve", description: "Stronger impact & clarity" },
  { id: "summary", label: "Summary", description: "Generate professional summary" },
  { id: "skills", label: "Skills", description: "Suggest relevant skills" },
  { id: "cover-letter", label: "Cover letter", description: "Draft a cover letter" },
  { id: "grammar", label: "Grammar fix", description: "Fix spelling & grammar" },
];

function AIToolsPanelInner() {
  const [loading, setLoading] = useState<AiEditorAction | null>(null);
  const selectedId = useCvEditorStore((s) => s.selectedId);
  const elements = useCvEditorStore((s) => s.elements);
  const updateElement = useCvEditorStore((s) => s.updateElement);
  const addSectionBlock = useCvEditorStore((s) => s.addSectionBlock);
  const { success, error: toastError } = useToast();

  const selected = elements.find((e) => e.id === selectedId);

  const runAction = async (action: AiEditorAction) => {
    setLoading(action);
    try {
      const res = await fetch("/api/cv/editor-ai", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          text: selected?.content ?? "",
          context: elements
            .filter((e) => e.type === "text" || e.type === "section")
            .map((e) => e.content)
            .join("\n\n")
            .slice(0, 4000),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "AI request failed");
      }

      const result = data.result as string;
      if (!result?.trim()) {
        throw new Error("Empty AI response");
      }

      if (action === "cover-letter") {
        addSectionBlock("Cover Letter", result);
      } else if (action === "skills") {
        addSectionBlock("Skills", result);
      } else if (action === "summary") {
        addSectionBlock("Professional Summary", result);
      } else if (selected) {
        updateElement(selected.id, { content: result });
      } else {
        addSectionBlock("AI Content", result);
      }

      success("AI complete", "Content updated.");
    } catch (err) {
      toastError(
        "AI unavailable",
        err instanceof Error ? err.message : "Please try again."
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-zinc-500">
        {selected
          ? "Apply AI to the selected text block."
          : "Select text or add a block first."}
      </p>
      {ACTIONS.map(({ id, label, description }) => (
        <button
          key={id}
          type="button"
          disabled={!!loading}
          onClick={() => void runAction(id)}
          className="flex w-full items-start gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-left hover:border-violet-300 hover:bg-violet-50/50 disabled:opacity-50"
        >
          {loading === id ? (
            <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-violet-600" />
          ) : (
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
          )}
          <span>
            <span className="block text-xs font-semibold text-zinc-800">{label}</span>
            <span className="block text-[10px] text-zinc-500">{description}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

export const AIToolsPanel = memo(AIToolsPanelInner);
