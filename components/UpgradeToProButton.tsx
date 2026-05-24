"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { STRIPE_LOOKUP_KEYS, type StripeLookupKey } from "@/lib/stripe-config";
import { useToast } from "@/components/ui/use-toast";

interface UpgradeToProButtonProps {
  lookupKey?: StripeLookupKey;
  label?: string;
  className?: string;
  variant?: "primary" | "gradient";
}

export default function UpgradeToProButton({
  lookupKey = STRIPE_LOOKUP_KEYS.PRO_MONTHLY,
  label = "Upgrade to Pro",
  className = "",
  variant = "gradient",
}: UpgradeToProButtonProps) {
  const [loading, setLoading] = useState(false);
  const { error: toastError } = useToast();

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ lookupKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      throw new Error("No checkout URL returned");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Checkout failed";
      toastError("Upgrade failed", message);
    } finally {
      setLoading(false);
    }
  };

  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60";
  const variantStyles =
    variant === "gradient"
      ? "bg-gradient-to-r from-gray-900 to-gray-700 text-white shadow-sm hover:from-gray-800 hover:to-gray-600"
      : "bg-gray-900 text-white hover:bg-gray-800";

  return (
    <button
      type="button"
      onClick={handleUpgrade}
      disabled={loading}
      className={`${baseStyles} ${variantStyles} ${className}`}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Sparkles size={18} />
      )}
      {loading ? "Redirecting…" : label}
    </button>
  );
}
