import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "SmartCV.AZ",
  description: "Professional CV builder with templates, Studio editor, and PDF export for modern job seekers.",
  path: "/",
});

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <BrandLogo href="/" showTagline={false} size="md" />
          <nav className="flex items-center gap-6 text-sm font-medium text-gray-700">
            <Link
              href="/login"
              className="rounded-xl bg-gray-900 px-4 py-2 text-white shadow-sm hover:bg-gray-800"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-[-240px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600/20 via-sky-500/20 to-cyan-500/20 blur-3xl" />
            <div className="absolute bottom-[-260px] left-[-120px] h-[420px] w-[420px] rounded-full bg-indigo-600/10 blur-3xl" />
            <div className="absolute bottom-[-220px] right-[-140px] h-[440px] w-[440px] rounded-full bg-sky-500/10 blur-3xl" />
          </div>

          <div className="mx-auto max-w-6xl px-6 pb-12 pt-12">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                  Built for professionals
                </div>
                <h1 className="mt-5 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                  Build a job-winning CV in minutes
                </h1>
                <p className="mt-4 text-lg leading-relaxed text-gray-600">
                  SmartCV Pro helps you create polished, career-ready resumes with a
                  workflow designed for job seekers—so you can focus on applications,
                  not formatting.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    href="/login"
                    className="inline-flex justify-center rounded-xl bg-gray-900 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-gray-800"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/dashboard"
                    className="inline-flex justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-base font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
                  >
                    Open Dashboard
                  </Link>
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-indigo-600" />
                    Used by job seekers
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-sky-600" />
                    Career-focused tools
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Your CV draft</p>
                      <p className="mt-1 text-sm text-gray-600">Ready to tailor for your next role</p>
                    </div>
                    <div className="rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm">
                      Free forever
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-gray-200 bg-white p-4">
                      <p className="text-sm font-semibold text-gray-900">Sections</p>
                      <p className="mt-2 text-sm text-gray-600">Experience, skills, education</p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-4">
                      <p className="text-sm font-semibold text-gray-900">Quality</p>
                      <p className="mt-2 text-sm text-gray-600">Clear, consistent, recruiter-friendly</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-4">
                    <p className="text-sm font-semibold text-gray-900">Next steps</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        "Update your role impact",
                        "Match the job description",
                        "Export in seconds",
                      ].map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">CV builder</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Create a clean resume structure in a guided, professional workflow.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Optimization</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Improve clarity and strengthen your positioning for the roles you want.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Job match</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Identify what recruiters look for and align your CV accordingly.
              </p>
            </div>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-semibold text-gray-900">How it works</h2>
              <p className="mt-2 text-sm text-gray-600">
                Three simple steps to go from draft to applications.
              </p>

              <div className="mt-6 space-y-4">
                {[{
                  n: "01",
                  t: "Build your CV",
                  d: "Start with the sections you need and keep everything consistent.",
                },{
                  n: "02",
                  t: "Improve for your target role",
                  d: "Strengthen wording, highlight impact, and align with the job description.",
                },{
                  n: "03",
                  t: "Export & apply",
                  d: "Download a recruiter-ready CV and keep your momentum.",
                }].map((s) => (
                  <div
                    key={s.n}
                    className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-sm font-semibold text-white">
                      {s.n}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-900">{s.t}</p>
                      <p className="mt-1 text-sm text-gray-600">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Trusted by job seekers</h2>
              <div className="mt-4 space-y-4">
                {[
                  {
                    q: "The CV structure is clear and easy to follow. I exported a version I was proud to submit.",
                    a: "Product Manager",
                  },
                  {
                    q: "The workflow kept me focused. My updates looked professional instead of scattered.",
                    a: "Software Engineer",
                  },
                  {
                    q: "It helped me translate my experience into impact. Hiring managers responded faster.",
                    a: "Marketing Specialist",
                  },
                ].map((t, idx) => (
                  <div key={idx} className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-sm font-medium text-gray-900">“{t.q}”</p>
                    <p className="mt-2 text-xs font-semibold text-gray-600">{t.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-14 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">Ready to build your CV?</p>
                <h3 className="mt-2 text-2xl font-semibold text-gray-900">
                  Professional templates, visual Studio, and PDF export
                </h3>
                <p className="mt-2 text-sm text-gray-600">Free CV builder — no credit card required.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="rounded-xl bg-gray-900 px-6 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
                >
                  Get Started
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-center text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-gray-100 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-gray-600">
                <p className="font-semibold text-gray-900">SmartCV Pro</p>
                <p className="mt-1">Built for professionals • Career-focused tools</p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm font-medium">
                <Link href="/login" className="text-gray-600 hover:text-gray-900">
                  Log in
                </Link>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
              </div>
            </div>
            <p className="mt-6 text-xs text-gray-500">© {new Date().getFullYear()} SmartCV Pro. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}

