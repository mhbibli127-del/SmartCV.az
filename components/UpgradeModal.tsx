"use client";

import { useEffect } from "react";
import { X, Sparkles, Check } from "lucide-react";
import { getPlan } from "@/lib/plans";
import { useSubscription } from "@/hooks/useSubscription";
import UpgradeToProButton from "@/components/UpgradeToProButton";

export default function UpgradeModal() {
  const { upgradeModalOpen, closeUpgradeModal, plan } = useSubscription();
  const proPlan = getPlan("pro");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeUpgradeModal();
    };
    if (upgradeModalOpen) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [upgradeModalOpen, closeUpgradeModal]);

  if (!upgradeModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeUpgradeModal}
        aria-label="Close modal"
      />
      <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
        <button
          type="button"
          onClick={closeUpgradeModal}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900 text-white">
          <Sparkles size={24} />
        </div>
        <h2 className="mt-4 text-xl font-bold text-gray-900">
          You&apos;ve reached your limit
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Upgrade to continue using AI features and unlock unlimited CVs on your{" "}
          <span className="font-medium capitalize">{plan}</span> plan.
        </p>
        <ul className="mt-6 space-y-2">
          {proPlan.features.slice(0, 5).map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
              <Check size={16} className="text-emerald-600" />
              {f}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <UpgradeToProButton
            className="flex-1 w-full py-3"
            label="Upgrade to Pro — $9.99/mo"
          />
          <button
            type="button"
            onClick={closeUpgradeModal}
            className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
