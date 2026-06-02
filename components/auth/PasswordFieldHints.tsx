"use client";

import { AUTH_LIMITS } from "@/lib/auth-validation";
import { cn } from "@/lib/utils";
import { useOptionalLanguage } from "@/components/i18n/LanguageProvider";

type PasswordFieldHintsProps = {
  password: string;
  className?: string;
};

export default function PasswordFieldHints({
  password,
  className,
}: PasswordFieldHintsProps) {
  const lang = useOptionalLanguage();
  const t = lang?.t ?? ((k: string) => k);

  const lenOk = password.length >= AUTH_LIMITS.passwordMin;
  const letterOk = /[a-zA-Z]/.test(password);
  const digitOk = /[0-9]/.test(password);
  const maxOk = password.length <= AUTH_LIMITS.passwordMax;

  const hints = [
    {
      ok: lenOk,
      label: `${AUTH_LIMITS.passwordMin}+ ${t("auth.chars")}`,
    },
    { ok: letterOk, label: "A–Z" },
    { ok: digitOk, label: "0–9" },
    { ok: maxOk || password.length === 0, label: `≤${AUTH_LIMITS.passwordMax}` },
  ];

  return (
    <ul className={cn("flex flex-wrap gap-2 text-[11px]", className)}>
      {hints.map((h) => (
        <li
          key={h.label}
          className={cn(
            "rounded-md px-2 py-0.5 font-medium",
            h.ok && password.length > 0
              ? "bg-emerald-50 text-emerald-700"
              : "bg-gray-100 text-gray-500"
          )}
        >
          {h.label}
        </li>
      ))}
    </ul>
  );
}
