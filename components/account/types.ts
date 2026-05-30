export type AccountSectionId =
  | "profile"
  | "security"
  | "notifications"
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

