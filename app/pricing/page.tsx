"use client";

import { useMemo, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { PLAN_CV_LIMITS, PLAN_PRICES, getPaddlePriceId } from "@/lib/user-plans";
import PaddleCheckoutButton from "@/components/PaddleCheckoutButton";

type PlanKey = "free" | "basic" | "pro";

type PricingPlan = {
  key: PlanKey;
  name: string;
  price: string;
  period: string;
  description: string;
  icon: ReactNode;
  features: string[];
  cta: string;
  highlighted?: boolean;
  paddlePlan?: "basic" | "pro";
};

export default function PricingPage() {
  const router = useRouter();

  const basicPriceId = getPaddlePriceId("basic") ?? "";
  const proPriceId = getPaddlePriceId("pro") ?? "";

  const plans = useMemo<PricingPlan[]>(
    () => [
      {
        key: "free",
        name: "Free",
        price: "$0",
        period: "forever",
        description: "Start building CVs instantly",
        icon: <Sparkles className="h-5 w-5" />,
        features: [
          `${PLAN_CV_LIMITS.free} CV limit`,
          "Basic templates",
          "PDF export",
          "Limited AI suggestions",
        ],
        cta: "Get Started",
      },
      {
        key: "basic",
        name: "Basic",
        price: `$${PLAN_PRICES.basic.toFixed(2)}`,
        period: "per month",
        description: "More CVs and premium features",
        icon: <Zap className="h-5 w-5" />,
        features: [
          `${PLAN_CV_LIMITS.basic} CV limit`,
          "Premium templates",
          "Job match insights",
          "No watermark",
        ],
        cta: "Subscribe — Basic",
        paddlePlan: "basic",
      },
      {
        key: "pro",
        name: "Pro",
        price: `$${PLAN_PRICES.pro.toFixed(2)}`,
        period: "per month",
        description: "Unlimited CVs and all AI features",
        icon: <Crown className="h-5 w-5" />,
        features: [
          "Unlimited CV generation",
          "All AI features unlocked",
          "Interview trainer",
          "Priority support",
        ],
        cta: "Subscribe — Pro",
        highlighted: true,
        paddlePlan: "pro",
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fafafa] to-white">
      <header className="border-b border-gray-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <BrandLogo href="/" showTagline size="md" />
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-violet-600">
            SmartCV Plans
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Simple pricing that scales with you
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Paddle-powered billing · Azerbaijan-friendly payments · Server-enforced limits
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <section
              key={plan.key}
              className={
                plan.highlighted
                  ? "relative flex flex-col rounded-2xl border-2 border-gray-900 bg-white p-6 shadow-xl"
                  : "relative flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              }
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gray-900 px-4 py-1 text-xs font-bold uppercase text-white">
                  Best Value
                </div>
              )}

              <div className="flex items-center gap-2">
                <span
                  className={
                    plan.highlighted
                      ? "rounded-lg bg-gray-900 p-2 text-white"
                      : "rounded-lg bg-gray-100 p-2"
                  }
                >
                  {plan.icon}
                </span>
                <h2 className="text-lg font-bold">{plan.name}</h2>
              </div>

              <p className="mt-3 text-sm text-gray-500">{plan.description}</p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-sm text-gray-500">/{plan.period}</span>
              </div>

              <ul className="mt-6 flex-1 space-y-3 text-sm text-gray-700">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {plan.key === "free" ? (
                  <button
                    type="button"
                    onClick={() => router.push("/register")}
                    className="w-full rounded-xl border border-gray-200 py-3 text-sm font-semibold hover:bg-gray-50"
                  >
                    {plan.cta}
                  </button>
                ) : (
                  <PaddleCheckoutButton
                    plan={plan.paddlePlan!}
                    priceId={plan.paddlePlan === "basic" ? basicPriceId : proPriceId}
                    label={plan.cta}
                    variant={plan.highlighted ? "default" : "outline"}
                    className="w-full"
                  />
                )}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-12 text-center text-xs text-gray-500">
          Subscription status is updated via Paddle webhook — never client-side.
        </p>
      </main>
    </div>
  );
}
