import { NextRequest } from "next/server";
import { parseJsonBody } from "@/lib/safe-route";
import { requireAiAccess, recordAiUsage, aiErrorResponse } from "@/lib/ai-route-guard";
import { getOpenAI } from "@/lib/openai";
import { analyzeDesign } from "@/lib/enterprise/ai/design-intelligence";
import type { DesignSuggestion } from "@/types/design-system";
import type { EditorElement } from "@/types/cv-document";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function sse(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: NextRequest) {
  try {
    const email = await requireAiAccess(req);
    const body = await parseJsonBody(req);
    const message = String(body.message ?? "").trim();
    const context =
      body.context && typeof body.context === "object" && !Array.isArray(body.context)
        ? (body.context as Record<string, unknown>)
        : {};
    const summary = String(context.summary ?? "").slice(0, 3000);
    const elements = (Array.isArray(context.elements) ? context.elements : []) as EditorElement[];

    if (!message) {
      return new Response(JSON.stringify({ error: "Message required" }), { status: 400 });
    }

    const issues = analyzeDesign(elements);
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const send = (payload: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(sse(payload)));
        };

        send({ type: "start" });

        try {
          const client = getOpenAI();
          const completion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.6,
            stream: true,
            messages: [
              {
                role: "system",
                content: `You are an elite resume design copilot. Respond conversationally in plain text (not JSON). Be concise, actionable, recruiter + designer focused.`,
              },
              {
                role: "user",
                content: `Request: ${message}\n\nResume:\n${summary || "(empty)"}`,
              },
            ],
          });

          let full = "";
          for await (const chunk of completion) {
            const delta = chunk.choices[0]?.delta?.content ?? "";
            if (delta) {
              full += delta;
              send({ type: "token", content: delta });
            }
          }

          const suggestions: DesignSuggestion[] = issues.slice(0, 3).map((issue) => ({
            id: issue.id,
            type:
              issue.type === "typography"
                ? "typography"
                : issue.type === "overflow"
                  ? "layout"
                  : "hierarchy",
            title: issue.message.slice(0, 60),
            description: issue.suggestion ?? issue.message,
            impact: issue.severity === "high" ? "high" : "medium",
            autoFixable: issue.autoFixable,
          }));

          const lower = message.toLowerCase();
          const applyTheme =
            lower.includes("theme") ||
            lower.includes("color") ||
            lower.includes("modern") ||
            lower.includes("redesign");

          send({
            type: "done",
            reply: full.trim() || "I've reviewed your design.",
            suggestions,
            applyTheme,
          });
        } catch (err) {
          send({
            type: "error",
            error: err instanceof Error ? err.message : "Stream failed",
          });
        } finally {
          await recordAiUsage(email, "design_copilot_stream");
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    return aiErrorResponse(err);
  }
}
