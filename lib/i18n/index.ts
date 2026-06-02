import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  LOCALES,
  messages,
  type Locale,
  type MessageTree,
} from "@/lib/i18n/messages";

export {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  LOCALES,
  messages,
  type Locale,
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function resolveLocale(stored?: string | null): Locale {
  if (stored && isLocale(stored)) return stored;
  return DEFAULT_LOCALE;
}

function getByPath(tree: MessageTree, path: string): string | undefined {
  const parts = path.split(".");
  let node: MessageTree | string = tree;
  for (const part of parts) {
    if (typeof node !== "object" || node === null) return undefined;
    const next: MessageTree | string | undefined = node[part];
    if (next === undefined) return undefined;
    node = next;
  }
  return typeof node === "string" ? node : undefined;
}

export function translate(locale: Locale, key: string): string {
  const value = getByPath(messages[locale], key);
  if (value) return value;
  const fallback = getByPath(messages[DEFAULT_LOCALE], key);
  return fallback ?? key;
}
