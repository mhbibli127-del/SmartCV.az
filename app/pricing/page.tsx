"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { useRouter } from "next/navigation";
import { Sparkles, Check } from "lucide-react";
import { STRIPE_LOOKUP_KEYS, type StripeLookupKey } from "@/lib/stripe-config";
import { useToast } from "@/components/ui/use-toast";

type BillingInterval = "monthly" | "yearly";

type PriceCard = {
  key: BillingInterval;
  title: string;
  priceText: string;
  subtitle: string;
  lookupKey: StripeLookupKey;
  features: string[];
  popular?: boolean;
};

export default function PricingPage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState<null | BillingInterval>(null);

  const cards = useMemo<PriceCard[]>(
    () => [
      {
        key: "monthly",
        title: "Pro Monthly",
        priceText: "$5.99/month",
        subtitle: "Best for job seekers",
        lookupKey: STRIPE_LOOKUP_KEYS.PRO_MONTHLY,
        popular: true,
        features: [
          "5 CV free limit",
          "AI-powered CV optimization",
          "Job match insights",
          "Skill gap analysis",
          "Interview trainer",
        ],
      },
      {
        key: "yearly",
        title: "Pro Yearly",
        priceText: "$49.99/year",
        subtitle: "Save vs monthly",
        lookupKey: STRIPE_LOOKUP_KEYS.PRO_YEARLY,
        features: [
          "5 CV free limit",
          "AI-powered CV optimization",
          "Job match insights",
          "Skill gap analysis",
          "Interview trainer",
        ],
      },
    ],
    []
  );

  const cancelAnytimeText = "Cancel anytime";
  const aiText = "AI-powered CV optimization";

  const cardLabelForFreeText = "5 CV free limit";


  const startCheckout = async (lookupKey: StripeLookupKey, interval: BillingInterval) => {
    setLoading(interval);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ lookup_key: lookupKey }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Checkout failed");
      }

      if (!data?.url) {
        throw new Error("No checkout URL returned");
      }

      window.location.href = data.url;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Checkout failed";
      toastError("Subscription failed", message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <BrandLogo href="/dashboard" showTagline size="md" />
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">SmartCV Pro</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Pricing that fits your job search
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Start free with <span className="font-semibold text-gray-700">5 CVs</span>, then upgrade when
            you’re ready.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-gray-600">
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-gray-900" /> {cancelAnytimeText}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-gray-900" /> Best for job seekers
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-gray-900" /> {aiText}
            </span>
          </div>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2 lg:items-stretch">
          {cards.map((card) => (
            <section
              key={card.key}
              className={
                card.popular
                  ? "relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-7 shadow-sm ring-1 ring-gray-900/5"
                  : "relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-7 shadow-sm"
              }
            >
              {card.popular && (
                <div className="absolute right-5 top-5 rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white">
                  Most Popular
                </div>
              )}

              <div className="flex items-start justify-between gap-5">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{card.title}</h2>
                  <p className="mt-1 text-sm text-gray-500">{card.subtitle}</p>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
                  <Sparkles className="h-4 w-4 text-gray-900" />
                  <span className="text-sm font-semibold text-gray-900">Pro</span>
                </div>
              </div>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight text-gray-900">{card.priceText}</span>
              </div>

              <ul className="mt-6 space-y-3 text-sm text-gray-700">
                {card.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-900">
                      <Check className="h-3.5 w-3.5 text-white" />
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-7">
                <button
                  type="button"
                  onClick={() => startCheckout(card.lookupKey, card.key)}
                  disabled={loading === card.key}
                  className={
                    card.popular
                      ? "w-full rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                      : "w-full rounded-xl bg-gray-100 px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
                  }
                >
                  {loading === card.key ? "Redirecting…" : "Start trial & subscribe"}
                </button>
              </div>

              <p className="mt-4 text-center text-xs text-gray-500">5 CV free limit included. Upgrade anytime.</p>
            </section>
          ))}
        </div>

        <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-7">
          <h3 className="text-lg font-semibold text-gray-900">Start Free Trial</h3>
          <p className="mt-2 text-sm text-gray-600">
            You get <span className="font-semibold text-gray-900">5 CVs</span> with AI-powered optimization. When you subscribe,
            your account unlocks Pro features. {cancelAnytimeText}.
          </p>
        </section>

        <div className="mt-10 text-center text-xs text-gray-500">
          Cancel anytime • Best for job seekers • AI-powered CV optimization
        </div>
      </main>
    </div>
  );
}

