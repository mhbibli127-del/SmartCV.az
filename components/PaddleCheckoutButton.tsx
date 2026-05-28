"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

declare global {
  interface Window {
    Paddle?: {
      Initialize: (opts: { token: string; environment?: string }) => void;
      Checkout: {
        open: (opts: {
          items: { priceId: string; quantity: number }[];
          customData?: Record<string, string>;
          customer?: { email?: string };
        }) => void;
      };
    };
  }
}

type PaddleCheckoutButtonProps = {
  plan: "basic" | "pro";
  priceId: string;
  label: string;
  variant?: "default" | "outline";
  className?: string;
};

export default function PaddleCheckoutButton({
  plan,
  priceId,
  label,
  variant = "default",
  className,
}: PaddleCheckoutButtonProps) {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const { error: toastError } = useToast();

  const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? "";
  const paddleEnv = process.env.NEXT_PUBLIC_PADDLE_ENV ?? "sandbox";

  useEffect(() => {
    if (window.Paddle && clientToken) {
      window.Paddle.Initialize({
        token: clientToken,
        environment: paddleEnv === "production" ? "production" : "sandbox",
      });
      setReady(true);
    }
  }, [clientToken, paddleEnv]);

  const openCheckout = async () => {
    if (!priceId || priceId.includes("here") || priceId.includes("your_")) {
      toastError("Paddle not configured", "Set PADDLE_PRICE_BASIC and PADDLE_PRICE_PRO in env.");
      return;
    }

    setLoading(true);
    try {
      let email = "";
      const me = await fetch("/api/auth/me", { credentials: "include" });
      if (me.ok) {
        const data = await me.json();
        email = data.email ?? "";
      }

      if (!email) {
        window.location.href = `/login?redirect=/pricing`;
        return;
      }

      if (!window.Paddle) {
        throw new Error("Paddle.js not loaded");
      }

      window.Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customData: { email, plan },
        customer: { email },
      });
    } catch (err) {
      toastError("Checkout failed", err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {clientToken && (
        <Script
          src="https://cdn.paddle.com/paddle/v2/paddle.js"
          strategy="afterInteractive"
          onLoad={() => {
            if (window.Paddle && clientToken) {
              window.Paddle.Initialize({
                token: clientToken,
                environment: paddleEnv === "production" ? "production" : "sandbox",
              });
              setReady(true);
            }
          }}
        />
      )}
      <Button
        type="button"
        variant={variant}
        className={className}
        disabled={loading || (!!clientToken && !ready)}
        onClick={openCheckout}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {loading ? "Opening checkout…" : label}
      </Button>
    </>
  );
}
