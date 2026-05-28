import type { ResumeContent } from "@/types/resume";

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/g;
const SENSITIVE_FIELD_IDS = new Set([
  "contact",
  "email",
  "phone",
  "address",
  "location",
]);

function redactText(text: string, forcePlaceholder = false): string {
  if (forcePlaceholder) {
    return "Contact details available in private copy";
  }
  return text
    .replace(EMAIL_RE, "[email hidden]")
    .replace(PHONE_RE, "[phone hidden]");
}

export function sanitizeResumeContentForPublish(
  content: ResumeContent
): ResumeContent {
  const clone = JSON.parse(JSON.stringify(content)) as ResumeContent;
  const elements = clone.canvas?.elements;

  if (!Array.isArray(elements)) return clone;

  clone.canvas!.elements = elements.map((raw) => {
    const el = raw as {
      id?: string;
      content?: string;
      text?: string;
      [key: string]: unknown;
    };
    const fieldId = el.id?.toLowerCase() ?? "";
    const force = SENSITIVE_FIELD_IDS.has(fieldId);
    const source = el.content ?? el.text ?? "";

    if (typeof source !== "string") return el;

    const safe = redactText(source, force);
    return {
      ...el,
      content: safe,
      text: safe,
    };
  });

  return clone;
}

export function sanitizeResumeTitle(title: string): string {
  return redactText(title).slice(0, 120) || "Community resume";
}
