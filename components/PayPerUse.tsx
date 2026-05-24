"use client";

import { useState } from "react";
import { FileDown, Sparkles, Target } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
// `CheckoutProduct` is not exported in this repo version.
// Keep the UI functional by using `string` product IDs.

type CheckoutProduct = string;

import SettingsCard from "@/components/account/ui/SettingsCard";
import SettingsButton from "@/components/account/ui/SettingsButton";

const ITEMS: {
  id: CheckoutProduct;
  label: string;
  price: string;
  description: string;
  icon: typeof FileDown;
}[] = [
  {
    id: "cv_export",
    label: "CV Export",
    price: "$1",
    description: "One watermark-free PDF export",
    icon: FileDown,
  },
  {
    id: "ai_rewrite",
    label: "AI Rewrite",
    price: "$0.50",
    description: "One advanced AI content rewrite",
    icon: Sparkles,
  },
  {
    id: "job_match",
    label: "Job Match",
    price: "$1",
    description: "One job match analysis report",
    icon: Target,
  },
];

export default function PayPerUse() {
  const { error: toastError } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (product: CheckoutProduct) => {
    setLoading(product);
    toastError(
      "Coming soon",
      "One-time add-ons will use Stripe Payment Links. Use Upgrade to Pro for subscriptions."
    );
    setLoading(null);
  };

  return (
    <SettingsCard
      title="Pay per use"
      description="Buy individual features without a subscription."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="group rounded-xl border border-gray-200 p-5 transition-all duration-200 hover:border-gray-300 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700 transition group-hover:bg-gray-900 group-hover:text-white">
                <Icon size={18} />
              </div>
              <p className="mt-4 font-semibold text-gray-900">{item.label}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{item.price}</p>
              <p className="mt-1 text-xs text-gray-500">{item.description}</p>
              <SettingsButton
                variant="secondary"
                className="mt-4 w-full"
                disabled={loading === item.id}
                onClick={() => handlePurchase(item.id)}
              >
                {loading === item.id ? "Processing…" : "Buy now"}
              </SettingsButton>
            </div>
          );
        })}
      </div>
    </SettingsCard>
  );
}
