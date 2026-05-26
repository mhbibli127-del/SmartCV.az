/** Input sanitization for XSS prevention */

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
};

export function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (c) => HTML_ENTITIES[c] ?? c);
}

export function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

export function sanitizeUserInput(input: string, maxLength = 5000): string {
  return stripHtmlTags(input).trim().slice(0, maxLength);
}

export function sanitizePrompt(input: string, maxLength = 1500): string {
  return sanitizeUserInput(input, maxLength)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
    .replace(/\s+/g, " ");
}

export function isValidObjectId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}
