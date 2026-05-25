"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

interface UpgradeButtonProps {
  plan?: "basic" | "pro";
  label?: string;
  className?: string;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
}

export default function UpgradeToProButton({
  plan = "pro",
  label = "Upgrade with Paddle",
  className = "",
  variant = "default",
  size = "default",
}: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);
  const { error: toastError } = useToast();

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/paddle/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      if (!data.url) throw new Error("No checkout URL returned");
      window.location.href = data.url;
    } catch (err) {
      toastError("Upgrade failed", err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleUpgrade}
      disabled={loading}
      className={className}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
      {loading ? "Redirecting…" : label}
    </Button>
  );
}
