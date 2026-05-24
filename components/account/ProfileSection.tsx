"use client";

import { useRef } from "react";
import { Camera } from "lucide-react";
import type { UserProfile } from "./types";
import SettingsCard from "./ui/SettingsCard";
import SettingsButton from "./ui/SettingsButton";

interface ProfileSectionProps {
  profile: UserProfile;
  onChange: (profile: UserProfile) => void;
  onSave: () => void;
  onCancel?: () => void;
  saving?: boolean;
}

export default function ProfileSection({
  profile,
  onChange,
  onSave,
  onCancel,
  saving = false,
}: ProfileSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange({ ...profile, avatarUrl: URL.createObjectURL(file) });
  };

  return (
    <SettingsCard
      title="Profile"
      description="Update your photo and personal details."
      footer={
        <>
          <SettingsButton variant="secondary" disabled={saving} onClick={onCancel}>
            Cancel
          </SettingsButton>
          <SettingsButton onClick={onSave} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </SettingsButton>
        </>
      }
    >
      <div className="space-y-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
            <img src={profile.avatarUrl} alt="Profile" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
              aria-label="Upload profile picture"
            >
              <Camera size={14} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Profile photo</p>
            <p className="mt-1 text-sm text-gray-500">JPG, PNG or GIF. Max 2MB recommended.</p>
            <SettingsButton variant="secondary" className="mt-3" onClick={() => fileInputRef.current?.click()}>
              Upload new photo
            </SettingsButton>
          </div>
        </div>
        <div className="grid gap-6">
          <div className="space-y-2">
            <label htmlFor="profile-name" className="text-sm font-medium text-gray-900">Full name</label>
            <input
              id="profile-name"
              type="text"
              value={profile.name}
              onChange={(e) => onChange({ ...profile, name: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="profile-email" className="text-sm font-medium text-gray-900">Email address</label>
            <input
              id="profile-email"
              type="email"
              value={profile.email}
              readOnly
              className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="profile-bio" className="text-sm font-medium text-gray-900">Bio</label>
            <textarea
              id="profile-bio"
              rows={4}
              value={profile.bio}
              onChange={(e) => onChange({ ...profile, bio: e.target.value })}
              placeholder="A short bio for your profile…"
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}
