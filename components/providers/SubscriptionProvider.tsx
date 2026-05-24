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
import type { PlanId } from "@/lib/plans";
import { PLAN_LIMITS } from "@/lib/plans";
import { useSession } from "next-auth/react";
import { shouldFetchAuthenticatedApis } from "@/lib/auth-client";

export interface UsageState {
  cvCount: number;
  aiCount: number;
}

interface SubscriptionContextValue {
  plan: PlanId;
  subscriptionPlan: string;
  subscriptionStatus: string;
  usage: UsageState;
  limits: (typeof PLAN_LIMITS)[PlanId];
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

const STORAGE_USAGE = "smartcv_usage";

const SubscriptionContext = createContext<SubscriptionContextValue | null>(
  null
);

function loadUsage(): UsageState {
  if (typeof window === "undefined") return { cvCount: 0, aiCount: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_USAGE);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { cvCount: 0, aiCount: 0 };
}

function normalizePlan(plan: string): PlanId {
  if (plan === "pro" || plan === "starter" || plan === "premium") return "pro";
  return "free";
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [plan, setPlan] = useState<PlanId>("free");
  const [subscriptionPlan, setSubscriptionPlan] = useState("free");
  const [subscriptionStatus, setSubscriptionStatus] = useState("inactive");
  const [usage, setUsage] = useState<UsageState>({ cvCount: 0, aiCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const limits = PLAN_LIMITS[normalizePlan(plan)] ?? PLAN_LIMITS.free;

  const refreshSubscription = useCallback(async () => {
    if (!shouldFetchAuthenticatedApis(status)) {
      setPlan("free");
      setSubscriptionPlan("free");
      setSubscriptionStatus("inactive");
      return;
    }
    try {
      const res = await fetch("/api/subscription", { credentials: "include" });
      if (res.status === 401) {
        setPlan("free");
        setSubscriptionPlan("free");
        setSubscriptionStatus("inactive");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        const nextPlan = normalizePlan(data.plan ?? "free");
        setPlan(nextPlan);
        setSubscriptionPlan(data.subscriptionPlan ?? "free");
        setSubscriptionStatus(data.subscriptionStatus ?? "inactive");

        // Server-reported CV count is the source of truth (localStorage is
        // bypassable). AI usage stays local for now since it isn't tracked
        // server-side yet.
        if (data.usage && typeof data.usage.cvCount === "number") {
          setUsage((prev) => {
            const next = { ...prev, cvCount: data.usage.cvCount };
            if (typeof window !== "undefined") {
              localStorage.setItem(STORAGE_USAGE, JSON.stringify(next));
            }
            return next;
          });
        }
      }
    } catch {
      /* keep cached plan */
    }
  }, [status]);

  useEffect(() => {
    setUsage(loadUsage());
    refreshSubscription().finally(() => setIsLoading(false));
  }, [refreshSubscription]);

  const persistUsage = useCallback((next: UsageState) => {
    setUsage(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_USAGE, JSON.stringify(next));
    }
  }, []);

  const openUpgradeModal = useCallback(() => setUpgradeModalOpen(true), []);
  const closeUpgradeModal = useCallback(() => setUpgradeModalOpen(false), []);

  const canUseAI = useCallback(() => {
    if (!Number.isFinite(limits.maxAI)) return true;
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
    if (!Number.isFinite(limits.maxAI)) return true;
    persistUsage({ ...usage, aiCount: usage.aiCount + 1 });
    return true;
  }, [canUseAI, limits.maxAI, usage, persistUsage]);

  const incrementCV = useCallback(() => {
    if (!canCreateCV()) {
      setUpgradeModalOpen(true);
      return false;
    }
    if (!Number.isFinite(limits.maxCV)) return true;
    persistUsage({ ...usage, cvCount: usage.cvCount + 1 });
    return true;
  }, [canCreateCV, limits.maxCV, usage, persistUsage]);

  const aiRemaining = useCallback(() => {
    if (!Number.isFinite(limits.maxAI)) return "unlimited" as const;
    return Math.max(0, limits.maxAI - usage.aiCount);
  }, [limits.maxAI, usage.aiCount]);

  const cvRemaining = useCallback(() => {
    if (!Number.isFinite(limits.maxCV)) return "unlimited" as const;
    return Math.max(0, limits.maxCV - usage.cvCount);
  }, [limits.maxCV, usage.cvCount]);

  const resetUsage = useCallback(() => {
    persistUsage({ cvCount: 0, aiCount: 0 });
  }, [persistUsage]);

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
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error("useSubscription must be used within SubscriptionProvider");
  }
  return ctx;
}
