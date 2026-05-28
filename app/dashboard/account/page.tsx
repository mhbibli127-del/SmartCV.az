"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import AccountLayout from "@/components/account/AccountLayout";
import ProfileSection from "@/components/account/ProfileSection";
import SecuritySection from "@/components/account/SecuritySection";
import NotificationSection from "@/components/account/NotificationSection";
import AIPreferencesSection from "@/components/account/AIPreferencesSection";
import DataPrivacySection from "@/components/account/DataPrivacySection";
import type {
  AccountSectionId,
  AiPreferences,
  NotificationPrefs,
  UserProfile,
} from "@/components/account/types";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api-client";

const DEFAULT_NOTIFICATIONS: NotificationPrefs = {
  email: true,
  jobAlerts: true,
  cvFeedback: true,
  marketing: false,
};

const DEFAULT_AI_PREFS: AiPreferences = {
  cvStyle: "modern",
  tone: "formal",
  language: "en",
  autoImprove: true,
};

function buildAvatarUrl(email: string) {
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(email)}&backgroundColor=f3f4f6`;
}

function loadStoredPrefs<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function AccountPageContent() {
  const { success, error: toastError } = useToast();
  const [activeSection, setActiveSection] = useState<AccountSectionId>("profile");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    name: "User",
    email: "user@example.com",
    bio: "",
    avatarUrl: buildAvatarUrl("user@example.com"),
  });
  const [savedProfile, setSavedProfile] = useState(profile);
  const [notifications, setNotifications] = useState<NotificationPrefs>(DEFAULT_NOTIFICATIONS);
  const [aiPrefs, setAiPrefs] = useState<AiPreferences>(DEFAULT_AI_PREFS);

  useEffect(() => {
    const loadUser = async () => {
      const { ok, data } = await api.get<{ email?: string; name?: string }>("/api/auth/me");
      let bio = "";
      let avatarUrl = buildAvatarUrl("user@example.com");
      try {
        const profileRes = await fetch("/api/user/profile", { credentials: "include" });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          bio = profileData.bio ?? "";
          if (profileData.avatar) {
            avatarUrl = profileData.avatar;
          }
        }
      } catch {
        /* optional */
      }
      if (ok && data.email) {
        const email = data.email.toLowerCase().trim();
        const name = data.name || email.split("@")[0] || "User";
        const next: UserProfile = {
          name,
          email,
          bio,
          avatarUrl: avatarUrl === buildAvatarUrl("user@example.com") ? buildAvatarUrl(email) : avatarUrl,
        };
        setProfile(next);
        setSavedProfile(next);
        setIsSuperAdmin(email === "mhbibli127@gmail.com");
        localStorage.setItem("user_email", email);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedEmail =
      localStorage.getItem("user_email") ||
      localStorage.getItem("auth_email");
    if (!storedEmail) {
      setNotifications(loadStoredPrefs("smartcv_notifications", DEFAULT_NOTIFICATIONS));
      setAiPrefs(loadStoredPrefs("smartcv_ai_prefs", DEFAULT_AI_PREFS));
      return;
    }
    const email = storedEmail.toLowerCase().trim();
    const namePart = email.split("@")[0] || "user";
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    setProfile((prev) => ({
      ...prev,
      email,
      name: prev.name === "User" ? formattedName : prev.name,
      avatarUrl:
        prev.avatarUrl.includes("res.cloudinary.com") || prev.avatarUrl.startsWith("blob:")
          ? prev.avatarUrl
          : buildAvatarUrl(email),
    }));
    setNotifications(loadStoredPrefs("smartcv_notifications", DEFAULT_NOTIFICATIONS));
    setAiPrefs(loadStoredPrefs("smartcv_ai_prefs", DEFAULT_AI_PREFS));
  }, []);

  const handleProfileSave = useCallback(async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          bio: profile.bio,
          avatar: profile.avatarUrl,
        }),
      });
      if (response.ok) {
        setSavedProfile(profile);
        success("Profile updated", "Your account details were saved.");
      } else {
        toastError("Update failed", "Could not save profile.");
      }
    } catch {
      toastError("Update failed", "Please try again.");
    } finally {
      setSaving(false);
    }
  }, [profile, success, toastError]);

  const handleNotificationsSave = useCallback(() => {
    localStorage.setItem("smartcv_notifications", JSON.stringify(notifications));
    success("Preferences saved", "Notification settings updated.");
  }, [notifications, success]);

  const handleAiPrefsSave = useCallback(() => {
    localStorage.setItem("smartcv_ai_prefs", JSON.stringify(aiPrefs));
    success("Preferences saved", "AI settings updated.");
  }, [aiPrefs, success]);

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return (
          <ProfileSection
            profile={profile}
            onChange={setProfile}
            onSave={handleProfileSave}
            onCancel={() => setProfile(savedProfile)}
            saving={saving}
          />
        );
      case "security":
        return <SecuritySection />;
      case "notifications":
        return (
          <NotificationSection
            prefs={notifications}
            onChange={setNotifications}
            onSave={handleNotificationsSave}
          />
        );
      case "ai":
        return (
          <AIPreferencesSection prefs={aiPrefs} onChange={setAiPrefs} onSave={handleAiPrefsSave} />
        );
      case "privacy":
        return <DataPrivacySection />;
      default:
        return null;
    }
  };

  return (
    <AccountLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      isSuperAdmin={isSuperAdmin}
    >
      {renderSection()}
    </AccountLayout>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-48 rounded-xl bg-gray-200" />
          <div className="h-64 rounded-xl bg-gray-100" />
        </div>
      }
    >
      <AccountPageContent />
    </Suspense>
  );
}
