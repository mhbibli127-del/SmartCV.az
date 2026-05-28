/**
 * Paddle Billing integration (Azerbaijan-friendly payments).
 * Stripe is NOT used — all paid plans go through Paddle.
 */
import crypto from "crypto";
import { getAppUrl } from "@/lib/env";
import type { UserPlan } from "@/lib/user-plans";

export type PaddlePlan = "basic" | "pro";

export const PADDLE_PLANS: Record<
  PaddlePlan,
  { priceUsd: number; label: string; cvLimit: string }
> = {
  basic: { priceUsd: 3.99, label: "Basic", cvLimit: "30 CVs" },
  pro: { priceUsd: 9.99, label: "Pro", cvLimit: "Unlimited CVs" },
};

function readEnv(name: string): string | null {
  const v = process.env[name]?.trim();
  return v && v.length > 0 ? v : null;
}

export function isPaddleConfigured(): boolean {
  const clientToken = readEnv("NEXT_PUBLIC_PADDLE_CLIENT_TOKEN");
  const hasClientToken = Boolean(clientToken && !isPaddlePlaceholder(clientToken));
  const hasApiKey = Boolean(readEnv("PADDLE_API_KEY"));
  const hasPriceIds = Boolean(getPaddlePriceId("basic") || getPaddlePriceId("pro"));

  return hasApiKey || hasClientToken || hasPriceIds;
}

function isPaddlePlaceholder(value: string): boolean {
  const lower = value.toLowerCase();
  return (
    lower.includes("your_") ||
    lower.includes("your-") ||
    lower.endsWith("_here") ||
    lower.includes("changeme")
  );
}

export function getPaddleApiBase(): string {
  const env = readEnv("PADDLE_ENV") ?? "sandbox";
  return env === "production"
    ? "https://api.paddle.com"
    : "https://sandbox-api.paddle.com";
}

export function getPaddlePriceId(plan: PaddlePlan): string | null {
  return plan === "basic"
    ? readEnv("PADDLE_PRICE_BASIC") ?? readEnv("PADDLE_BASIC_PRICE_ID")
    : readEnv("PADDLE_PRICE_PRO") ?? readEnv("PADDLE_PRO_PRICE_ID");
}

export function paddlePlanFromPriceId(priceId: string): UserPlan | null {
  const basic = readEnv("PADDLE_PRICE_BASIC") ?? readEnv("PADDLE_BASIC_PRICE_ID");
  const pro = readEnv("PADDLE_PRICE_PRO") ?? readEnv("PADDLE_PRO_PRICE_ID");
  if (priceId === basic) return "basic";
  if (priceId === pro) return "pro";
  return null;
}

/** Map Paddle subscription status → app plan active check */
export function isPaddleSubscriptionActive(status: string | null | undefined): boolean {
  if (!status) return false;
  const s = status.toLowerCase();
  return s === "active" || s === "trialing" || s === "past_due";
}

export interface PaddleCheckoutResult {
  ok: true;
  checkoutUrl: string;
  transactionId?: string;
}

export interface PaddleCheckoutError {
  ok: false;
  error: string;
  status: number;
}

/**
 * Create a Paddle checkout session (Transaction) and return redirect URL.
 * Falls back to a placeholder URL when Paddle is not configured (dev mode).
 */
export async function createPaddleCheckout(params: {
  plan: PaddlePlan;
  userId: number;
  email: string;
}): Promise<PaddleCheckoutResult | PaddleCheckoutError> {
  const priceId = getPaddlePriceId(params.plan);
  const apiKey = readEnv("PADDLE_API_KEY");
  const appUrl = getAppUrl();

  if (!apiKey || !priceId) {
    // Dev / placeholder — redirect to pricing with plan hint
    const placeholder = `${appUrl}/pricing?paddle=mock&plan=${params.plan}&userId=${params.userId}`;
    console.warn(
      "[paddle] Not configured — returning placeholder checkout URL. " +
        "Set PADDLE_API_KEY and PADDLE_*_PRICE_ID in environment."
    );
    return { ok: true, checkoutUrl: placeholder };
  }

  try {
    const res = await fetch(`${getPaddleApiBase()}/transactions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [{ price_id: priceId, quantity: 1 }],
        customer: { email: params.email },
        custom_data: {
          userId: String(params.userId),
          plan: params.plan,
        },
        checkout: {
          url: `${appUrl}/dashboard/account?checkout=success`,
        },
      }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      data?: {
        id?: string;
        checkout?: { url?: string };
      };
      error?: { detail?: string };
    };

    if (!res.ok) {
      const detail = data.error?.detail ?? `Paddle API error (${res.status})`;
      console.error("[paddle] Checkout failed:", detail);
      return { ok: false, error: detail, status: 502 };
    }

    const checkoutUrl = data.data?.checkout?.url;
    if (!checkoutUrl) {
      return {
        ok: false,
        error: "Paddle did not return a checkout URL",
        status: 502,
      };
    }

    return {
      ok: true,
      checkoutUrl,
      transactionId: data.data?.id,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Paddle checkout failed";
    console.error("[paddle] Checkout exception:", message);
    return { ok: false, error: message, status: 500 };
  }
}

/** Verify Paddle webhook signature (Paddle-Signature header). */
export function verifyPaddleWebhook(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const secret = readEnv("PADDLE_WEBHOOK_SECRET");
  if (!secret) {
    console.warn("[paddle] PADDLE_WEBHOOK_SECRET not set — skipping verification (dev only)");
    return process.env.NODE_ENV !== "production";
  }
  if (!signatureHeader) return false;

  // Paddle Billing: ts=123;h1=hexdigest
  const parts = Object.fromEntries(
    signatureHeader.split(";").map((p) => {
      const [k, v] = p.split("=");
      return [k.trim(), v?.trim() ?? ""];
    })
  );

  const ts = parts.ts;
  const h1 = parts.h1;
  if (!ts || !h1) return false;

  const payload = `${ts}:${rawBody}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(h1, "hex"),
      Buffer.from(expected, "hex")
    );
  } catch {
    return false;
  }
}

export type PaddleWebhookEvent = {
  event_type?: string;
  event_id?: string;
  data?: {
    id?: string;
    status?: string;
    customer_id?: string;
    custom_data?: { userId?: string; plan?: string };
    items?: { price?: { id?: string } }[];
  };
};

export function parsePaddleEventType(raw: string): string {
  return raw.replace(/\./g, "_").toLowerCase();
}
