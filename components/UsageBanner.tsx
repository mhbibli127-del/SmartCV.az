"use client";

import Link from "next/link";
import { Zap, ArrowUpRight } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { ProgressBar } from "@/components/ui/page-shell";
import { Button } from "@/components/ui/button";

export default function UsageBanner({ compact = false }: { compact?: boolean }) {
  const { plan, aiRemaining, usage, limits, openUpgradeModal } = useSubscription();
  const ai = aiRemaining();

  if (plan === "pro") {
    if (compact) return null;
    return (
      <div className="flex items-center gap-2 rounded-[12px] border border-emerald-500/20 bg-emerald-50/50 px-4 py-2.5 text-sm">
        <Zap className="h-3.5 w-3.5 text-emerald-600" />
        <span className="font-medium text-emerald-800">Pro</span>
        <span className="text-emerald-700/80">· Unlimited CVs & AI</span>
      </div>
    );
  }

  const aiMax = Number.isFinite(limits.maxAI) ? limits.maxAI : null;
  const aiUsed = aiMax !== null && typeof ai === "number" ? aiMax - ai : 0;
  const cvMax = Number.isFinite(limits.maxCV) ? limits.maxCV : null;
  const cvUsed = usage.cvCount;
  const cvLimitReached = cvMax !== null && cvUsed >= cvMax;

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
        {cvMax !== null && (
          <span className="rounded-md bg-zinc-100 px-2 py-1 tabular-nums">
            {cvUsed}/{cvMax} CVs
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-[14px] border border-black/[0.08] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium capitalize text-zinc-600">
              {plan} plan
            </span>
            {cvLimitReached && (
              <span className="text-xs font-medium text-amber-600">Limit reached</span>
            )}
          </div>
          {cvMax !== null && (
            <ProgressBar label="CV usage" value={cvUsed} max={cvMax} />
          )}
          {aiMax !== null && (
            <ProgressBar label="AI generations" value={aiUsed} max={aiMax} />
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/pricing">
              View plans
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button size="sm" onClick={openUpgradeModal}>
            Upgrade
          </Button>
        </div>
      </div>
    </div>
  );
}
