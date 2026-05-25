import type { EditorCanvasState, EditorElement } from "@/types/cv-document";
import { A4_HEIGHT, A4_WIDTH } from "@/lib/layout-engine";
import { normalizeForExport } from "@/lib/cv-normalizer";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderCanvasHtml(canvas: EditorCanvasState, accent: string): string {
  const elements = [...canvas.elements].sort((a, b) => a.zIndex - b.zIndex);
  const body = elements
    .map((el) => {
      const style = [
        `position:absolute`,
        `left:${el.x}px`,
        `top:${el.y}px`,
        `width:${el.width}px`,
        `min-height:${el.height}px`,
        `font-size:${el.fontSize ?? 12}px`,
        `color:${el.fill ?? "#18181b"}`,
        `font-weight:${el.fontWeight ?? "normal"}`,
        `font-family:Inter,system-ui,sans-serif`,
        `line-height:1.4`,
        `z-index:${el.zIndex}`,
      ].join(";");
      const text = escapeHtml(el.text ?? el.content ?? "");
      if (el.type === "section") {
        return `<div style="${style}"><div style="font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:${accent};margin-bottom:4px">${escapeHtml(el.sectionType ?? "section")}</div>${text.replace(/\n/g, "<br/>")}</div>`;
      }
      return `<div style="${style}">${text.replace(/\n/g, "<br/>")}</div>`;
    })
    .join("");

  return `<div style="position:relative;width:${canvas.width}px;height:${canvas.height}px;background:#fff;margin:0 auto">${body}</div>`;
}

function renderStructuredHtml(data: ReturnType<typeof normalizeForExport>): string {
  const accent = data.accentColor ?? "#18181b";
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const experience = Array.isArray(data.experience) ? data.experience : [];
  const education = Array.isArray(data.education) ? data.education : [];

  return `
    <div style="font-family:Inter,system-ui,sans-serif;color:#18181b;padding:48px;max-width:794px;margin:0 auto">
      <div style="border-bottom:2px solid ${accent};padding-bottom:16px;margin-bottom:24px">
        <h1 style="margin:0;font-size:28px;font-weight:700">${escapeHtml(data.fullName || "My CV")}</h1>
        ${data.title ? `<p style="margin:8px 0 0;color:${accent};font-weight:600">${escapeHtml(data.title)}</p>` : ""}
        <p style="margin:8px 0 0;font-size:12px;color:#52525b">
          ${[data.email, data.phone, data.location, data.website].filter(Boolean).map((v) => escapeHtml(String(v))).join(" · ")}
        </p>
      </div>
      ${data.summary ? `<section style="margin-bottom:20px"><h2 style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#71717a;margin:0 0 8px">Summary</h2><p style="margin:0;font-size:13px;line-height:1.6;color:#3f3f46">${escapeHtml(String(data.summary))}</p></section>` : ""}
      ${experience.length ? `<section style="margin-bottom:20px"><h2 style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#71717a;margin:0 0 12px">Experience</h2>${experience.map((exp: Record<string, unknown>) => `<div style="margin-bottom:12px;padding-left:12px;border-left:2px solid ${accent}"><p style="margin:0;font-weight:600">${escapeHtml(String(exp.title ?? ""))}</p><p style="margin:2px 0;font-size:12px;color:#52525b">${escapeHtml(String(exp.company ?? ""))}</p></div>`).join("")}</section>` : ""}
      ${education.length ? `<section style="margin-bottom:20px"><h2 style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#71717a;margin:0 0 12px">Education</h2>${education.map((edu: Record<string, unknown>) => `<div style="margin-bottom:8px"><p style="margin:0;font-weight:600">${escapeHtml(String(edu.degree ?? ""))}</p><p style="margin:2px 0;font-size:12px;color:#52525b">${escapeHtml(String(edu.university ?? edu.school ?? ""))}</p></div>`).join("")}</section>` : ""}
      ${skills.length ? `<section><h2 style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#71717a;margin:0 0 8px">Skills</h2><div style="display:flex;flex-wrap:wrap;gap:6px">${skills.map((s: unknown) => `<span style="background:#f4f4f5;padding:4px 10px;border-radius:999px;font-size:11px">${escapeHtml(String(s))}</span>`).join("")}</div></section>` : ""}
    </div>`;
}

export function buildPdfHtml(cvData: unknown, accentColor = "#18181b"): string {
  const data = cvData as Record<string, unknown>;
  let body = "";

  const canvas = (data.canvas ?? (data.content as Record<string, unknown>)?.canvas) as
    | EditorCanvasState
    | undefined;

  if (canvas?.elements?.length) {
    body = renderCanvasHtml(canvas, accentColor);
  } else {
    body = renderStructuredHtml(normalizeForExport(cvData, accentColor));
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>@page{size:A4;margin:0}body{margin:0;padding:0;background:#fff}</style></head><body>${body}</body></html>`;
}

export function defaultPdfDimensions() {
  return { width: A4_WIDTH, height: A4_HEIGHT };
}
