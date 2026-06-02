"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export function AuthShell({ children }: { children: ReactNode }) {
  const { t } = useLanguage();

  return (
    <div className="relative min-h-screen bg-[#fafafa]">
      <header className="absolute left-0 right-0 top-0 z-10 border-b border-gray-100/80 bg-[#fafafa]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <BrandLogo href="/" showTagline={false} size="sm" />
          <div className="flex items-center gap-4">
            <Link
              href="/blog"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              {t("nav.about")}
            </Link>
            <LanguageSwitcher compact />
          </div>
        </div>
      </header>
      <div className="pt-20">{children}</div>
    </div>
  );
}
