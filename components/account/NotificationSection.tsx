"use client";

import type { NotificationPrefs } from "./types";
import SettingsCard from "./ui/SettingsCard";
import ToggleSwitch from "./ui/ToggleSwitch";
import SettingsButton from "./ui/SettingsButton";

interface NotificationSectionProps {
  prefs: NotificationPrefs;
  onChange: (prefs: NotificationPrefs) => void;
  onSave: () => void;
  saving?: boolean;
}

export default function NotificationSection({
  prefs,
  onChange,
  onSave,
  saving = false,
}: NotificationSectionProps) {
  const update = (key: keyof NotificationPrefs, value: boolean) => {
    onChange({ ...prefs, [key]: value });
  };

  return (
    <SettingsCard
      title="Notifications"
      description="Choose what updates you receive by email."
      footer={
        <SettingsButton onClick={onSave} disabled={saving}>
          {saving ? "Saving…" : "Save preferences"}
        </SettingsButton>
      }
    >
      <div className="divide-y divide-gray-100">
        <ToggleSwitch label="Email notifications" description="Account activity, security alerts, and product updates." enabled={prefs.email} onChange={(v) => update("email", v)} />
        <ToggleSwitch label="Job alerts" description="New job matches based on your CV and preferences." enabled={prefs.jobAlerts} onChange={(v) => update("jobAlerts", v)} />
        <ToggleSwitch label="CV feedback alerts" description="AI suggestions and improvement tips for your CV." enabled={prefs.cvFeedback} onChange={(v) => update("cvFeedback", v)} />
        <ToggleSwitch label="Marketing emails" description="Tips, feature announcements, and special offers." enabled={prefs.marketing} onChange={(v) => update("marketing", v)} />
      </div>
    </SettingsCard>
  );
}
