"use client";

import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <BrandLogo href="/" showTagline={false} size="md" />
          <nav className="flex flex-wrap items-center justify-end gap-3 text-sm font-medium text-gray-700">
            <Link href="/blog" className="hover:text-gray-900">
              {t("nav.about")}
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

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-[-240px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600/20 via-sky-500/20 to-cyan-500/20 blur-3xl" />
          </div>

          <div className="mx-auto max-w-6xl px-6 pb-12 pt-12">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                  {t("home.badge")}
                </div>
                <h1 className="mt-5 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                  {t("home.title")}
                </h1>
                <p className="mt-4 text-lg leading-relaxed text-gray-600">
                  {t("home.subtitle")}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    href="/login"
                    className="inline-flex justify-center rounded-xl bg-gray-900 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-gray-800"
                  >
                    {t("home.cta")}
                  </Link>
                  <Link
                    href="/dashboard"
                    className="inline-flex justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-base font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
                  >
                    {t("nav.openDashboard")}
                  </Link>
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-indigo-600" />
                    {t("home.usedBy")}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-sky-600" />
                    {t("home.tools")}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {t("home.draftTitle")}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">{t("home.draftSub")}</p>
                    </div>
                    <div className="rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm">
                      {t("home.free")}
                    </div>
                  </div>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-gray-200 bg-white p-4">
                      <p className="text-sm font-semibold text-gray-900">{t("home.sections")}</p>
                      <p className="mt-2 text-sm text-gray-600">{t("home.sectionsDesc")}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-4">
                      <p className="text-sm font-semibold text-gray-900">{t("home.quality")}</p>
                      <p className="mt-2 text-sm text-gray-600">{t("home.qualityDesc")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="grid gap-8 lg:grid-cols-3">
            {[
              { t: "home.feature1", d: "home.feature1Desc" },
              { t: "home.feature2", d: "home.feature2Desc" },
              { t: "home.feature3", d: "home.feature3Desc" },
            ].map((f) => (
              <div
                key={f.t}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <h2 className="text-lg font-semibold text-gray-900">{t(f.t)}</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{t(f.d)}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900">{t("home.howTitle")}</h2>
            <p className="mt-2 text-sm text-gray-600">{t("home.howSub")}</p>
            <div className="mt-6 space-y-4">
              {[
                { n: "01", t: "home.step1t", d: "home.step1d" },
                { n: "02", t: "home.step2t", d: "home.step2d" },
                { n: "03", t: "home.step3t", d: "home.step3d" },
              ].map((s) => (
                <div
                  key={s.n}
                  className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-sm font-semibold text-white">
                    {s.n}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-900">{t(s.t)}</p>
                    <p className="mt-1 text-sm text-gray-600">{t(s.d)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <h3 className="text-2xl font-semibold text-gray-900">{t("home.readyTitle")}</h3>
            <p className="mt-2 text-sm text-gray-600">{t("home.readySub")}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="rounded-xl bg-gray-900 px-6 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
              >
                {t("nav.getStarted")}
              </Link>
              <Link
                href="/blog"
                className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-center text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
              >
                {t("nav.about")}
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-gray-100 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-gray-600">{t("home.footer")}</p>
              <div className="flex flex-wrap gap-4 text-sm font-medium">
                <Link href="/blog" className="text-gray-600 hover:text-gray-900">
                  {t("nav.about")}
                </Link>
                <Link href="/login" className="text-gray-600 hover:text-gray-900">
                  {t("nav.login")}
                </Link>
              </div>
            </div>
            <p className="mt-6 text-xs text-gray-500">
              © {new Date().getFullYear()} SmartCV.AZ. {t("home.copyright")}
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
