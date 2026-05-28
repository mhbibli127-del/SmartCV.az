"use client";

import type { ReactNode } from "react";
import {
  User,
  Shield,
  Bell,
  Sparkles,
  Database,
} from "lucide-react";
import type { AccountNavItem, AccountSectionId } from "./types";

const NAV_ITEMS: AccountNavItem[] = [
  { id: "profile", label: "Profile", description: "Your personal information" },
  { id: "security", label: "Security", description: "Password and sessions" },
  {
    id: "notifications",
    label: "Notifications",
    description: "Email and alert preferences",
  },
  { id: "ai", label: "AI Preferences", description: "CV generation defaults" },
  { id: "privacy", label: "Data & Privacy", description: "Export and account data" },
];

const ICONS: Record<AccountSectionId, typeof User> = {
  profile: User,
  security: Shield,
  notifications: Bell,
  ai: Sparkles,
  privacy: Database,
};

interface AccountLayoutProps {
  activeSection: AccountSectionId;
  onSectionChange: (id: AccountSectionId) => void;
  children: ReactNode;
  isSuperAdmin?: boolean;
}

export default function AccountLayout({
  activeSection,
  onSectionChange,
  children,
  isSuperAdmin = false,
}: AccountLayoutProps) {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-wider text-gray-500">
          Account
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
          Settings
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-500">
          Manage your profile, security, and preferences.
        </p>
        {isSuperAdmin && (
          <span className="mt-3 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
            Super Admin
          </span>
        )}
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.id];
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSectionChange(item.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gray-900 text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
        <nav className="hidden w-56 shrink-0 lg:block">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = ICONS[item.id];
              const isActive = activeSection === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSectionChange(item.id)}
                    className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 ${
                      isActive
                        ? "bg-gray-900 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={`mt-0.5 shrink-0 ${
                        isActive ? "text-white" : "text-gray-400"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p
                        className={`mt-0.5 text-xs ${
                          isActive ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        {item.description}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="min-w-0 flex-1 space-y-6">{children}</div>
      </div>
    </div>
  );
}
