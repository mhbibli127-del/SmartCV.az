"use client";

import { AlertTriangle, Download } from "lucide-react";
import SettingsCard from "./ui/SettingsCard";
import SettingsButton from "./ui/SettingsButton";
import { useToast } from "@/components/ui/use-toast";

export default function DataPrivacySection() {
  const { success, error: toastError } = useToast();

  return (
    <div className="space-y-6">
      <SettingsCard title="Export your data" description="Download a copy of your profile, CVs, and account activity.">
        <p className="text-sm text-gray-500">
          You&apos;ll receive an email with a secure link to download your data in JSON format.
        </p>
        <SettingsButton variant="secondary" className="mt-4" onClick={() => success("Export started", "We'll email you when your data is ready.")}>
          <Download size={16} />
          Export user data
        </SettingsButton>
      </SettingsCard>
      <div className="rounded-xl border border-red-200 bg-red-50/50 p-6 shadow-sm">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-red-900">Danger zone</h3>
            <p className="mt-1 text-sm text-red-800/80">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
            <SettingsButton
              variant="danger"
              className="mt-4"
              onClick={() => {
                if (window.confirm("Delete your account permanently?")) {
                  toastError("Account deletion", "Please contact support to complete deletion.");
                }
              }}
            >
              Delete account
            </SettingsButton>
          </div>
        </div>
      </div>
    </div>
  );
}
