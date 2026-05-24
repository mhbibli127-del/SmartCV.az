"use client";

import Link from "next/link";
import { Sparkles, FileText, Zap } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

export default function UsageBanner({ compact = false }: { compact?: boolean }) {
  const { plan, aiRemaining, usage, limits, openUpgradeModal } =
    useSubscription();
  const ai = aiRemaining();

  if (plan !== "free") {
    if (compact) return null;
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm">
        <Zap size={16} className="text-emerald-600" />
        <span className="font-medium capitalize text-emerald-800">
          {plan} plan
        </span>
        <span className="text-emerald-700">— Unlimited AI &amp; CVs</span>
      </div>
    );
  }

  const aiLabel =
    ai === "unlimited"
      ? "Unlimited AI"
      : `${ai}/${Number.isFinite(limits.maxAI) ? limits.maxAI : "∞"} AI uses left`;

  const cvUsed = usage.cvCount;
  const cvMax = Number.isFinite(limits.maxCV) ? limits.maxCV : null;
  const cvLabel =
    cvMax === null
      ? "Unlimited CVs"
      : `${cvUsed}/${cvMax} CV${cvMax === 1 ? "" : "s"} used`;
  const cvLimitReached = cvMax !== null && cvUsed >= cvMax;

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-1">
          <Sparkles size={12} />
          {aiLabel}
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 ${
            cvLimitReached
              ? "bg-amber-100 text-amber-800"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          <FileText size={12} />
          {cvLabel}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-4">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-amber-900">
          <Sparkles size={16} />
          {aiLabel}
        </span>
        <span className="inline-flex items-center gap-2 text-sm font-medium text-amber-900">
          <FileText size={16} />
          {cvLabel}
          {cvLimitReached && (
            <span className="ml-2 rounded-full bg-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-900">
              Limit reached
            </span>
          )}
        </span>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={openUpgradeModal}
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          Upgrade
        </button>
        <Link
          href="/pricing"
          className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          View plans
        </Link>
      </div>
    </div>
  );
}
