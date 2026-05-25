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
import {
  type UserPlan,
  PLAN_CV_LIMITS,
  PLAN_AI_LIMITS,
} from "@/lib/user-plans";
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

const STORAGE_USAGE = "smartcv_usage";

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

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

function normalizePlan(plan: string): UserPlan {
  if (plan === "basic" || plan === "pro") return plan;
  return "free";
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [plan, setPlan] = useState<UserPlan>("free");
  const [subscriptionPlan, setSubscriptionPlan] = useState("free");
  const [subscriptionStatus, setSubscriptionStatus] = useState("active");
  const [usage, setUsage] = useState<UsageState>({ cvCount: 0, aiCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const maxCV = PLAN_CV_LIMITS[plan];
  const maxAI = PLAN_AI_LIMITS[plan];

  const refreshSubscription = useCallback(async () => {
    if (!shouldFetchAuthenticatedApis(status)) {
      setPlan("free");
      setSubscriptionPlan("free");
      setSubscriptionStatus("active");
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
        if (data.usage && typeof data.usage.cvCount === "number") {
          setUsage((prev) => {
            const next = { ...prev, cvCount: data.usage.cvCount };
            localStorage.setItem(STORAGE_USAGE, JSON.stringify(next));
            return next;
          });
        }
      }
    } catch {
      /* keep cached */
    }
  }, [status]);

  useEffect(() => {
    setUsage(loadUsage());
    refreshSubscription().finally(() => setIsLoading(false));
  }, [refreshSubscription]);

  const persistUsage = useCallback((next: UsageState) => {
    setUsage(next);
    localStorage.setItem(STORAGE_USAGE, JSON.stringify(next));
  }, []);

  const openUpgradeModal = useCallback(() => setUpgradeModalOpen(true), []);
  const closeUpgradeModal = useCallback(() => setUpgradeModalOpen(false), []);

  const canUseAI = useCallback(() => {
    if (!Number.isFinite(maxAI)) return true;
    return usage.aiCount < maxAI;
  }, [maxAI, usage.aiCount]);

  const canCreateCV = useCallback(() => {
    if (!Number.isFinite(maxCV)) return true;
    return usage.cvCount < maxCV;
  }, [maxCV, usage.cvCount]);

  const incrementAI = useCallback(() => {
    if (!canUseAI()) {
      setUpgradeModalOpen(true);
      return false;
    }
    if (!Number.isFinite(maxAI)) return true;
    persistUsage({ ...usage, aiCount: usage.aiCount + 1 });
    return true;
  }, [canUseAI, maxAI, usage, persistUsage]);

  const incrementCV = useCallback(() => {
    if (!canCreateCV()) {
      setUpgradeModalOpen(true);
      return false;
    }
    if (!Number.isFinite(maxCV)) return true;
    persistUsage({ ...usage, cvCount: usage.cvCount + 1 });
    return true;
  }, [canCreateCV, maxCV, usage, persistUsage]);

  const aiRemaining = useCallback(() => {
    if (!Number.isFinite(maxAI)) return "unlimited" as const;
    return Math.max(0, maxAI - usage.aiCount);
  }, [maxAI, usage.aiCount]);

  const cvRemaining = useCallback(() => {
    if (!Number.isFinite(maxCV)) return "unlimited" as const;
    return Math.max(0, maxCV - usage.cvCount);
  }, [maxCV, usage.cvCount]);

  const resetUsage = useCallback(() => {
    persistUsage({ cvCount: 0, aiCount: 0 });
  }, [persistUsage]);

  const value = useMemo(
    () => ({
      plan,
      subscriptionPlan,
      subscriptionStatus,
      usage,
      limits: {
        maxCV: Number.isFinite(maxCV) ? maxCV : Infinity,
        maxAI: Number.isFinite(maxAI) ? maxAI : Infinity,
      },
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
      maxCV,
      maxAI,
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
