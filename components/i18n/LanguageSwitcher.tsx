"use client";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { LOCALES, type Locale } from "@/lib/i18n";

const LABELS: Record<Locale, string> = {
  az: "AZ",
  en: "EN",
  ru: "RU",
};

type LanguageSwitcherProps = {
  className?: string;
  compact?: boolean;
};

export default function LanguageSwitcher({
  className,
  compact = false,
}: LanguageSwitcherProps) {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      className={cn(
        "inline-flex rounded-xl border border-gray-200 bg-white p-0.5 shadow-sm",
        className
      )}
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className={cn(
            "rounded-lg px-2.5 py-1.5 text-xs font-semibold transition",
            locale === code
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-50",
            compact && "px-2 py-1"
          )}
        >
          {LABELS[code]}
        </button>
      ))}
    </div>
  );
}
