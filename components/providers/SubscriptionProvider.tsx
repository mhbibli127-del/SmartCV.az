"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { type UserPlan, PLAN_CV_LIMITS, PLAN_AI_LIMITS } from "@/lib/user-plans";
import { useSession } from "next-auth/react";
import { shouldFetchAuthenticatedApis } from "@/lib/auth-client";

export interface UsageState {
  cvCount: number;
  aiCount: number;
}

interface SubscriptionContextValue {
  plan: UserPlan;
  subscriptionPlan: string;
  subscriptionStatus: string;
  usage: UsageState;
  limits: { maxCV: number; maxAI: number };
  isLoading: boolean;
  upgradeModalOpen: boolean;
  refreshSubscription: () => Promise<void>;
  openUpgradeModal: () => void;
  closeUpgradeModal: () => void;
  incrementAI: () => boolean;
  incrementCV: () => boolean;
  canUseAI: () => boolean;
  canCreateCV: () => boolean;
  aiRemaining: () => number | "unlimited";
  cvRemaining: () => number | "unlimited";
  resetUsage: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

function normalizePlan(plan: string): UserPlan {
  if (plan === "basic" || plan === "pro") return plan;
  return "free";
}

function resolveLimit(value: number | null | undefined, fallback: number): number {
  if (value === null || value === undefined) return fallback;
  return value;
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [plan, setPlan] = useState<UserPlan>("free");
  const [subscriptionPlan, setSubscriptionPlan] = useState("free");
  const [subscriptionStatus, setSubscriptionStatus] = useState("active");
  const [usage, setUsage] = useState<UsageState>({ cvCount: 0, aiCount: 0 });
  const [limits, setLimits] = useState({ maxCV: PLAN_CV_LIMITS.free, maxAI: PLAN_AI_LIMITS.free });
  const [isLoading, setIsLoading] = useState(true);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const refreshSubscription = useCallback(async () => {
    if (!shouldFetchAuthenticatedApis(status)) {
      setPlan("free");
      setSubscriptionPlan("free");
      setSubscriptionStatus("active");
      setUsage({ cvCount: 0, aiCount: 0 });
      setLimits({ maxCV: PLAN_CV_LIMITS.free, maxAI: PLAN_AI_LIMITS.free });
      return;
    }
    try {
      const res = await fetch("/api/subscription", { credentials: "include" });
      if (res.status === 401) {
        setPlan("free");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        const nextPlan = normalizePlan(data.plan ?? "free");
        setPlan(nextPlan);
        setSubscriptionPlan(data.subscriptionPlan ?? "free");
        setSubscriptionStatus(data.subscriptionStatus ?? data.status ?? "active");

        const cvCount = data.usage?.cvCount ?? data.usage?.cvUsed ?? 0;
        const aiCount = data.usage?.aiCount ?? data.usage?.aiUsed ?? 0;
        setUsage({ cvCount, aiCount });

        const maxCV =
          data.limits?.maxCV === null
            ? Infinity
            : resolveLimit(data.limits?.maxCV, PLAN_CV_LIMITS[nextPlan]);
        const maxAI =
          data.limits?.maxAI === null
            ? Infinity
            : resolveLimit(data.limits?.maxAI, PLAN_AI_LIMITS[nextPlan]);
        setLimits({ maxCV, maxAI });
      }
    } catch {
      /* keep last known server state */
    }
  }, [status]);

  useEffect(() => {
    refreshSubscription().finally(() => setIsLoading(false));
  }, [refreshSubscription]);

  const openUpgradeModal = useCallback(() => setUpgradeModalOpen(true), []);
  const closeUpgradeModal = useCallback(() => setUpgradeModalOpen(false), []);

  const canUseAI = useCallback(() => {
    if (!Number.isFinite(limits.maxAI)) return true;
    if (limits.maxAI === 0) return false;
    return usage.aiCount < limits.maxAI;
  }, [limits.maxAI, usage.aiCount]);

  const canCreateCV = useCallback(() => {
    if (!Number.isFinite(limits.maxCV)) return true;
    return usage.cvCount < limits.maxCV;
  }, [limits.maxCV, usage.cvCount]);

  const incrementAI = useCallback(() => {
    if (!canUseAI()) {
      setUpgradeModalOpen(true);
      return false;
    }
    return true;
  }, [canUseAI]);

  const incrementCV = useCallback(() => {
    if (!canCreateCV()) {
      setUpgradeModalOpen(true);
      return false;
    }
    return true;
  }, [canCreateCV]);

  const aiRemaining = useCallback(() => {
    if (!Number.isFinite(limits.maxAI)) return "unlimited" as const;
    return Math.max(0, limits.maxAI - usage.aiCount);
  }, [limits.maxAI, usage.aiCount]);

  const cvRemaining = useCallback(() => {
    if (!Number.isFinite(limits.maxCV)) return "unlimited" as const;
    return Math.max(0, limits.maxCV - usage.cvCount);
  }, [limits.maxCV, usage.cvCount]);

  const resetUsage = useCallback(() => {
    setUsage({ cvCount: 0, aiCount: 0 });
  }, []);

  const value = useMemo(
    () => ({
      plan,
      subscriptionPlan,
      subscriptionStatus,
      usage,
      limits,
      isLoading,
      upgradeModalOpen,
      refreshSubscription,
      openUpgradeModal,
      closeUpgradeModal,
      incrementAI,
      incrementCV,
      canUseAI,
      canCreateCV,
      aiRemaining,
      cvRemaining,
      resetUsage,
    }),
    [
      plan,
      subscriptionPlan,
      subscriptionStatus,
      usage,
      limits,
      isLoading,
      upgradeModalOpen,
      refreshSubscription,
      openUpgradeModal,
      closeUpgradeModal,
      incrementAI,
      incrementCV,
      canUseAI,
      canCreateCV,
      aiRemaining,
      cvRemaining,
      resetUsage,
    ]
  );

  return (
    <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error("useSubscription must be used within SubscriptionProvider");
  }
  return ctx;
}
