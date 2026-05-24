"use client";

import { useRouter } from "next/navigation";
import type { PlanId } from "@/lib/plans";
import { getPlan } from "@/lib/plans";
import { useSubscription } from "@/hooks/useSubscription";
import type { BillingHistoryItem } from "./types";
import SettingsCard from "./ui/SettingsCard";
import SettingsButton from "./ui/SettingsButton";
import PayPerUse from "@/components/PayPerUse";
import UpgradeToProButton from "@/components/UpgradeToProButton";
import { STRIPE_LOOKUP_KEYS } from "@/lib/stripe-config";

const MOCK_HISTORY: BillingHistoryItem[] = [
  { id: "inv_001", date: "Apr 1, 2026", amount: "$7.00", status: "paid" },
  { id: "inv_002", date: "Mar 1, 2026", amount: "$7.00", status: "paid" },
  { id: "inv_003", date: "Feb 1, 2026", amount: "$0.00", status: "pending" },
];

const PLAN_BADGE: Record<string, string> = {
  free: "bg-gray-100 text-gray-700 ring-gray-200",
  starter: "bg-blue-600 text-white",
  pro: "bg-gray-900 text-white",
  premium: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white",
};

export default function BillingSection() {
  const router = useRouter();
  const { plan, subscriptionStatus, refreshSubscription } = useSubscription();
  const planDef = getPlan(plan);
  const isPaid = plan !== "free";

  return (
    <div className="space-y-6">
      <SettingsCard title="Current plan" description="Manage your subscription and billing cycle.">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex rounded-lg px-3 py-1 text-sm font-semibold capitalize ${PLAN_BADGE[plan]}`}>
                {planDef.name}
              </span>
              {isPaid && subscriptionStatus && (
                <span className="text-sm text-gray-500 capitalize">
                  Status: {subscriptionStatus}
                </span>
              )}
            </div>
            <p className="mt-3 text-sm text-gray-500">{planDef.description}</p>
            <ul className="mt-4 grid gap-1 sm:grid-cols-2">
              {planDef.features.slice(0, 4).map((f) => (
                <li key={f} className="text-sm text-gray-600">• {f}</li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap gap-2">
            {plan === "free" && (
              <>
                <UpgradeToProButton label="Upgrade to Pro" />
                <UpgradeToProButton
                  lookupKey={STRIPE_LOOKUP_KEYS.STARTER_MONTHLY}
                  label="Starter — $5.99"
                  variant="primary"
                />
              </>
            )}
            {plan === "starter" && (
              <UpgradeToProButton label="Upgrade to Pro" />
            )}
            <SettingsButton
              variant="secondary"
              onClick={() => {
                refreshSubscription();
                router.push("/pricing");
              }}
            >
              View all plans
            </SettingsButton>
          </div>
        </div>
      </SettingsCard>

      <PayPerUse />

      <SettingsCard title="Billing history" description="Download invoices for your records.">
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Invoice</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Amount</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {MOCK_HISTORY.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-gray-50/80">
                  <td className="px-4 py-3 text-gray-900">{row.date}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{row.id}</td>
                  <td className="px-4 py-3 text-gray-900">{row.amount}</td>
                  <td className="px-4 py-3 capitalize text-gray-600">{row.status}</td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SettingsCard>
    </div>
  );
}
