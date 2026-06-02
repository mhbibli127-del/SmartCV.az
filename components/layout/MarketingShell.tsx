"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export function MarketingShell({ children }: { children: ReactNode }) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <BrandLogo href="/" showTagline={false} size="md" />
          <nav className="flex items-center gap-3 text-sm font-medium text-gray-700">
            <Link href="/blog" className="hover:text-gray-900">
              {t("nav.about")}
            </Link>
            <Link href="/login" className="hover:text-gray-900">
              {t("nav.login")}
            </Link>
            <LanguageSwitcher compact />
            <Link
              href="/login"
              className="rounded-xl bg-gray-900 px-4 py-2 text-white shadow-sm hover:bg-gray-800"
            >
              {t("nav.getStarted")}
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
