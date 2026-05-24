"use client";

import { useState } from "react";
import { Laptop, Monitor, Smartphone } from "lucide-react";
import SettingsCard from "./ui/SettingsCard";
import SettingsButton from "./ui/SettingsButton";
import ToggleSwitch from "./ui/ToggleSwitch";
import { useToast } from "@/components/ui/use-toast";

const MOCK_SESSIONS = [
  { id: "1", device: "Windows PC", browser: "Chrome", location: "Baku, AZ", lastActive: "Active now", icon: Monitor, current: true },
  { id: "2", device: "iPhone 15", browser: "Safari", location: "Baku, AZ", lastActive: "2 hours ago", icon: Smartphone, current: false },
  { id: "3", device: "MacBook Pro", browser: "Firefox", location: "Remote", lastActive: "3 days ago", icon: Laptop, current: false },
];

export default function SecuritySection() {
  const { success } = useToast();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [savingPassword, setSavingPassword] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return;
    setSavingPassword(true);
    await new Promise((r) => setTimeout(r, 600));
    setSavingPassword(false);
    setPasswords({ current: "", new: "", confirm: "" });
    success("Password updated", "Your password has been changed.");
  };

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Change password"
        description="Use a strong password you don't use elsewhere."
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
              />
            </div>
          ))}
          {passwords.confirm && passwords.new !== passwords.confirm && (
            <p className="text-xs text-red-600">Passwords do not match.</p>
          )}
        </form>
      </SettingsCard>
      <SettingsCard title="Two-factor authentication" description="Add an extra layer of security.">
        <ToggleSwitch
          label="Enable two-factor authentication"
          description="Require a verification code when signing in."
          enabled={twoFactorEnabled}
          onChange={setTwoFactorEnabled}
        />
      </SettingsCard>
      <SettingsCard
        title="Active sessions"
        description="Devices where you're currently signed in."
        footer={
          <SettingsButton variant="secondary" onClick={() => success("Sessions revoked", "Logged out from all other devices.")}>
            Logout from all devices
          </SettingsButton>
        }
      >
        <ul className="divide-y divide-gray-100">
          {MOCK_SESSIONS.map((session) => {
            const Icon = session.icon;
            return (
              <li key={session.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {session.device}{" "}
                      {session.current && (
                        <span className="ml-1 rounded-md bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-green-600/20">
                          This device
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">{session.browser} · {session.location}</p>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-gray-500">{session.lastActive}</span>
              </li>
            );
          })}
        </ul>
      </SettingsCard>
    </div>
  );
}
