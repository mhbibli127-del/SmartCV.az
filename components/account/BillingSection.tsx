"use client";

import { useRouter } from "next/navigation";
import { useSubscription } from "@/hooks/useSubscription";
import { PLAN_CV_LIMITS, PLAN_PRICES, type UserPlan } from "@/lib/user-plans";
import SettingsCard from "./ui/SettingsCard";
import SettingsButton from "./ui/SettingsButton";
import PaddleCheckoutButton from "@/components/PaddleCheckoutButton";
import { Badge } from "@/components/ui/badge";
import { getPaddlePriceId } from "@/lib/user-plans";

const PLAN_LABELS: Record<UserPlan, string> = {
  free: "Free",
  basic: "Basic",
  pro: "Pro",
};

export default function BillingSection() {
  const router = useRouter();
  const { plan, subscriptionStatus, usage, refreshSubscription } = useSubscription();
  const userPlan = (["free", "basic", "pro"] as UserPlan[]).includes(plan as UserPlan)
    ? (plan as UserPlan)
    : "free";
  const cvLimit = PLAN_CV_LIMITS[userPlan];
  const isPaid = userPlan === "basic" || userPlan === "pro";

  return (
    <div className="space-y-6">
      <SettingsCard title="Current plan" description="Billing via Paddle — webhook updates access.">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge variant={userPlan === "pro" ? "pro" : "secondary"} className="capitalize">
              {PLAN_LABELS[userPlan]}
            </Badge>
            {isPaid && subscriptionStatus && (
              <p className="mt-2 text-sm capitalize text-gray-500">Status: {subscriptionStatus}</p>
            )}
            <p className="mt-3 text-sm text-gray-600">
              CV usage:{" "}
              <span className="font-semibold">
                {usage.cvCount} / {Number.isFinite(cvLimit) ? cvLimit : "∞"}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {userPlan === "free" && (
              <>
                <PaddleCheckoutButton
                  plan="basic"
                  priceId={getPaddlePriceId("basic") ?? ""}
                  label={`Basic — $${PLAN_PRICES.basic}/mo`}
                  variant="outline"
                />
                <PaddleCheckoutButton
                  plan="pro"
                  priceId={getPaddlePriceId("pro") ?? ""}
                  label={`Pro — $${PLAN_PRICES.pro}/mo`}
                />
              </>
            )}
            {userPlan === "basic" && (
              <PaddleCheckoutButton
                plan="pro"
                priceId={getPaddlePriceId("pro") ?? ""}
                label="Upgrade to Pro"
              />
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
    </div>
  );
}
