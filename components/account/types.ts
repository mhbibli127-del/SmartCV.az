import type { PlanId } from "@/lib/plans";

export type AccountSectionId =
  | "profile"
  | "security"
  | "notifications"
  | "ai"
  | "privacy";

export interface AccountNavItem {
  id: AccountSectionId;
  label: string;
  description: string;
}

export interface UserProfile {
  name: string;
  email: string;
  bio: string;
  avatarUrl: string;
}

export interface NotificationPrefs {
  email: boolean;
  jobAlerts: boolean;
  cvFeedback: boolean;
  marketing: boolean;
}

export interface AiPreferences {
  cvStyle: "modern" | "minimal" | "creative";
  tone: "formal" | "friendly" | "aggressive";
  language: "en" | "az" | "ru";
  autoImprove: boolean;
}

export interface BillingInfo {
  plan: PlanId;
  nextBillingDate: string | null;
}

export interface BillingHistoryItem {
  id: string;
  date: string;
  amount: string;
  status: "paid" | "pending" | "failed";
}
