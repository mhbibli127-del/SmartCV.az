const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "secret",
  "apiKey",
  "api_key",
  "authorization",
  "cookie",
  "rawExperience",
  "rawEducation",
  "rawSkills",
  "cvData",
  "prompt",
  "openai",
]);

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

/**
 * Strip PII and sensitive fields before sending analytics payloads.
 * GDPR-safe: never ship full CV content or credentials.
 */
export function sanitizeAnalyticsProperties(
  properties: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(properties)) {
    const lower = key.toLowerCase();
    if (SENSITIVE_KEYS.has(key) || lower.includes("password") || lower.includes("secret")) {
      continue;
    }

    if (typeof value === "string") {
      out[key] = value.replace(EMAIL_PATTERN, "[redacted]");
      continue;
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
      out[key] = sanitizeAnalyticsProperties(value as Record<string, unknown>);
      continue;
    }

    out[key] = value;
  }

  return out;
}
