"use client";

import Link from "next/link";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
        {t("about.title")}
      </h1>
      <p className="mt-3 text-lg text-gray-600">{t("about.subtitle")}</p>
      <div className="mt-8 space-y-4 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm leading-relaxed text-gray-700">
        <p>{t("about.p1")}</p>
        <p>{t("about.p2")}</p>
        <p className="text-sm text-gray-500">
          Murad Habibli · SmartCV.AZ · {new Date().getFullYear()}
        </p>
      </div>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
      >
        {t("about.back")}
      </Link>
    </div>
  );
}
