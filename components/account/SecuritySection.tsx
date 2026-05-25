"use client";

import { useState } from "react";
import { Monitor } from "lucide-react";
import SettingsCard from "./ui/SettingsCard";
import SettingsButton from "./ui/SettingsButton";
import { useToast } from "@/components/ui/use-toast";

export default function SecuritySection() {
  const { success, error: toastError } = useToast();
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [savingPassword, setSavingPassword] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toastError("Passwords don't match", "Please confirm your new password.");
      return;
    }
    if (passwords.new.length < 8) {
      toastError("Weak password", "Use at least 8 characters.");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "OAUTH_ONLY") {
          toastError("Google account", data.error);
        } else {
          toastError("Update failed", data.error || "Could not change password.");
        }
        return;
      }
      setPasswords({ current: "", new: "", confirm: "" });
      success("Password updated", "Your password has been changed.");
    } catch {
      toastError("Update failed", "Something went wrong. Try again.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Change password"
        description="Use a strong password you don't use elsewhere. Google sign-in accounts cannot set a password here."
        footer={
          <SettingsButton type="submit" form="change-password-form" disabled={savingPassword}>
            {savingPassword ? "Updating…" : "Update password"}
          </SettingsButton>
        }
      >
        <form id="change-password-form" onSubmit={handlePasswordSubmit} className="max-w-md space-y-4">
          {(["current", "new", "confirm"] as const).map((field) => (
            <div key={field} className="space-y-2">
              <label htmlFor={`${field}-password`} className="text-sm font-medium text-gray-900 capitalize">
                {field === "current" ? "Current" : field === "new" ? "New" : "Confirm new"} password
              </label>
              <input
                id={`${field}-password`}
                type="password"
                value={passwords[field]}
                onChange={(e) => setPasswords((p) => ({ ...p, [field]: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                required
                minLength={field !== "current" ? 8 : undefined}
                autoComplete={field === "current" ? "current-password" : "new-password"}
              />
            </div>
          ))}
          {passwords.confirm && passwords.new !== passwords.confirm && (
            <p className="text-xs text-red-600">Passwords do not match.</p>
          )}
        </form>
      </SettingsCard>
      <SettingsCard title="Active session" description="You are signed in on this device.">
        <div className="flex items-center gap-4 py-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
            <Monitor size={18} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              This device{" "}
              <span className="ml-1 rounded-md bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-green-600/20">
                Active now
              </span>
            </p>
            <p className="text-sm text-gray-500">Sign out from the sidebar to end your session.</p>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
