"use client";

import { memo, useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Loader2, Sparkles } from "lucide-react";
import { useDesignStore } from "@/lib/design-store";
import { useEditorStore } from "@/lib/editor-store";
import { cn } from "@/lib/utils";

function AICopilotInner() {
  const open = useDesignStore((s) => s.copilotOpen);
  const messages = useDesignStore((s) => s.copilotMessages);
  const streaming = useDesignStore((s) => s.copilotStreaming);
  const toggle = useDesignStore((s) => s.toggleCopilot);
  const addMessage = useDesignStore((s) => s.addCopilotMessage);
  const setStreaming = useDesignStore((s) => s.setCopilotStreaming);
  const applyThemeToCanvas = useDesignStore((s) => s.applyThemeToCanvas);
  const [input, setInput] = useState("");
  const [streamBuffer, setStreamBuffer] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const streamIdRef = useRef<string | null>(null);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;

    addMessage({ role: "user", content: text });
    setInput("");
    setStreaming(true);
    setStreamBuffer("");
    streamIdRef.current = `stream-${Date.now()}`;

    try {
      const elements = useEditorStore.getState().elements;
      const summary = elements
        .filter((e) => e.text || e.content)
        .map((e) => e.text ?? e.content)
        .join("\n")
        .slice(0, 2000);

      const res = await fetch("/api/v1/design/copilot/stream", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          context: { summary, elements },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Copilot unavailable");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let finalSuggestions: import("@/types/design-system").DesignSuggestion[] | undefined;
      let applyTheme = false;

      if (reader) {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const payload = JSON.parse(line.slice(6)) as {
              type: string;
              content?: string;
              reply?: string;
              suggestions?: import("@/types/design-system").DesignSuggestion[];
              applyTheme?: boolean;
              error?: string;
            };

            if (payload.type === "token" && payload.content) {
              accumulated += payload.content;
              setStreamBuffer(accumulated);
            }
            if (payload.type === "done") {
              accumulated = payload.reply ?? accumulated;
              finalSuggestions = payload.suggestions;
              applyTheme = Boolean(payload.applyTheme);
            }
            if (payload.type === "error") {
              throw new Error(payload.error ?? "Stream error");
            }
          }
        }
      }

      addMessage({
        role: "assistant",
        content: accumulated || "I've analyzed your resume design.",
        suggestions: finalSuggestions,
      });

      if (applyTheme) applyThemeToCanvas();
    } catch (e) {
      addMessage({
        role: "assistant",
        content: e instanceof Error ? e.message : "Something went wrong. Try again.",
      });
    } finally {
      setStreaming(false);
      setStreamBuffer("");
      streamIdRef.current = null;
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [
    input,
    streaming,
    addMessage,
    setStreaming,
    applyThemeToCanvas,
  ]);

  return (
    <>
      <motion.button
        type="button"
        onClick={toggle}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl shadow-2xl transition",
          open
            ? "bg-zinc-800 text-white"
            : "bg-gradient-to-br from-violet-600 to-indigo-600 text-white hover:shadow-[0_0_32px_rgba(139,92,246,0.4)]"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="AI Copilot"
      >
        {open ? <X className="h-5 w-5" /> : <Bot className="h-6 w-6" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="os-glass fixed bottom-24 right-6 z-50 flex h-[min(520px,70vh)] w-[min(380px,92vw)] flex-col overflow-hidden rounded-2xl shadow-2xl"
          >
            <div className="border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-400" />
                <p className="text-sm font-semibold text-white">AI Design Copilot</p>
              </div>
              <p className="mt-0.5 text-xs text-zinc-400">Streaming · recruiter + designer AI</p>
            </div>

            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "max-w-[90%] rounded-2xl px-3 py-2 text-sm",
                    m.role === "user"
                      ? "ml-auto bg-violet-600/80 text-white"
                      : "bg-white/5 text-zinc-200"
                  )}
                >
                  {m.content}
                  {m.suggestions?.slice(0, 2).map((s) => (
                    <p key={s.id} className="mt-2 text-xs text-violet-300/90">
                      → {s.title}
                    </p>
                  ))}
                </div>
              ))}
              {streaming && streamBuffer && (
                <div className="max-w-[90%] rounded-2xl bg-white/5 px-3 py-2 text-sm text-zinc-200">
                  {streamBuffer}
                  <span className="ml-0.5 inline-block h-3 w-1 animate-pulse bg-violet-400" />
                </div>
              )}
              {streaming && !streamBuffer && (
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Thinking…
                </div>
              )}
            </div>

            <div className="border-t border-white/10 p-3">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                  placeholder="Make this more modern, ATS optimized…"
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={streaming || !input.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export const AICopilot = memo(AICopilotInner);
