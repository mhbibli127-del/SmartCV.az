"use client";

import type { AiPreferences } from "./types";
import SettingsCard from "./ui/SettingsCard";
import SettingsSelect from "./ui/SettingsSelect";
import ToggleSwitch from "./ui/ToggleSwitch";
import SettingsButton from "./ui/SettingsButton";

interface AIPreferencesSectionProps {
  prefs: AiPreferences;
  onChange: (prefs: AiPreferences) => void;
  onSave: () => void;
  saving?: boolean;
}

export default function AIPreferencesSection({
  prefs,
  onChange,
  onSave,
  saving = false,
}: AIPreferencesSectionProps) {
  return (
    <SettingsCard
      title="AI Preferences"
      description="Default settings for CV generation and improvements."
      footer={
        <SettingsButton onClick={onSave} disabled={saving}>
          {saving ? "Saving…" : "Save preferences"}
        </SettingsButton>
      }
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <SettingsSelect
          label="Default CV style"
          description="Applied when creating a new CV."
          value={prefs.cvStyle}
          onChange={(v) => onChange({ ...prefs, cvStyle: v as AiPreferences["cvStyle"] })}
          options={[
            { value: "modern", label: "Modern" },
            { value: "minimal", label: "Minimal" },
            { value: "creative", label: "Creative" },
          ]}
        />
        <SettingsSelect
          label="Tone"
          description="Writing style for AI-generated content."
          value={prefs.tone}
          onChange={(v) => onChange({ ...prefs, tone: v as AiPreferences["tone"] })}
          options={[
            { value: "formal", label: "Formal" },
            { value: "friendly", label: "Friendly" },
            { value: "aggressive", label: "Aggressive" },
          ]}
        />
        <SettingsSelect
          label="Language"
          description="Primary language for generated CVs."
          value={prefs.language}
          onChange={(v) => onChange({ ...prefs, language: v as AiPreferences["language"] })}
          options={[
            { value: "en", label: "English (EN)" },
            { value: "az", label: "Azerbaijani (AZ)" },
            { value: "ru", label: "Russian (RU)" },
          ]}
        />
        <div className="sm:col-span-2 rounded-xl border border-gray-100 bg-gray-50/50 px-4">
          <ToggleSwitch
            label="Auto-improve"
            description="Automatically suggest improvements while you edit your CV."
            enabled={prefs.autoImprove}
            onChange={(v) => onChange({ ...prefs, autoImprove: v })}
          />
        </div>
      </div>
    </SettingsCard>
  );
}
