"use client";

import { Check } from "lucide-react";
import type { BillingInterval, PlanDefinition } from "@/lib/plans";
import { formatPlanPrice } from "@/lib/plans";

interface PricingCardProps {
  plan: PlanDefinition;
  interval: BillingInterval;
  onSelect: (planId: PlanDefinition["id"]) => void;
  loading?: boolean;
}

export default function PricingCard({
  plan,
  interval,
  onSelect,
  loading = false,
}: PricingCardProps) {
  const price = formatPlanPrice(plan.id, interval);
  const period = interval === "yearly" ? "/year" : "/month";
  const isPopular = plan.popular;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg ${
        isPopular
          ? "scale-[1.03] border-gray-900 shadow-md ring-2 ring-gray-900/10 z-10"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gray-900 px-4 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-sm">
          Most Popular
        </span>
      )}
      <div>
        <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
        <p className="mt-2 text-sm text-gray-500">{plan.description}</p>
        <div className="mt-6 flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight text-gray-900">{price}</span>
          {plan.monthlyPrice > 0 && (
            <span className="text-sm text-gray-500">{period}</span>
          )}
        </div>
      </div>
      <ul className="mt-8 flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-gray-600">
            <Check size={16} className="mt-0.5 shrink-0 text-gray-900" />
            {feature}
          </li>
        ))}
      </ul>
      <button
        type="button"
        disabled={loading}
        onClick={() => onSelect(plan.id)}
        className={`mt-8 w-full rounded-xl py-3 text-sm font-semibold transition-all duration-200 disabled:opacity-50 ${
          isPopular
            ? "bg-gradient-to-r from-gray-900 to-gray-700 text-white shadow-sm hover:from-gray-800 hover:to-gray-600"
            : plan.id === "free"
              ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              : "bg-gray-900 text-white hover:bg-gray-800"
        }`}
      >
        {plan.id === "free" ? "Get started" : `Upgrade to ${plan.name}`}
      </button>
    </div>
  );
}
