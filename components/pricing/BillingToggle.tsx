"use client";

import type { BillingInterval } from "@/lib/plans";

interface BillingToggleProps {
  interval: BillingInterval;
  onChange: (interval: BillingInterval) => void;
}

export default function BillingToggle({ interval, onChange }: BillingToggleProps) {
  return (
    <div className="inline-flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
      <button
        type="button"
        onClick={() => onChange("monthly")}
        className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
          interval === "monthly"
            ? "bg-gray-900 text-white shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        Monthly
      </button>
      <button
        type="button"
        onClick={() => onChange("yearly")}
        className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
          interval === "yearly"
            ? "bg-gray-900 text-white shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        Yearly
        <span className="ml-1.5 rounded-md bg-emerald-100 px-1.5 py-0.5 text-xs font-bold text-emerald-700">
          Save 20%
        </span>
      </button>
    </div>
  );
}
