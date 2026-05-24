"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Settings, Bell } from "lucide-react";

export default function SettingsPanel() {
  const router = useRouter();
  return (
    <div className="bg-[#020617] border border-slate-800 rounded-2xl p-8 max-w-2xl">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
        <Settings size={20} className="text-slate-500" /> Account Settings
      </h3>
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-4">
            <Bell className="text-blue-400" size={20} />
            <div>
              <p className="text-sm font-semibold text-slate-200">Email Notifications</p>
              <p className="text-xs text-slate-500">Get alerts for profile views and matches.</p>
            </div>
          </div>
          <div className="w-10 h-5 bg-blue-600 rounded-full relative">
            <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.push("/dashboard/settings")}
          className="w-full py-3 bg-slate-800 text-slate-200 rounded-xl text-sm font-bold hover:bg-slate-700 transition-all"
        >
          Update Preferences
        </button>
      </div>
    </div>
  );
}