"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { GripVertical, Plus } from "lucide-react";

const sections = ["Personal Info", "Summary", "Experience", "Education", "Skills", "Languages", "Projects"];

export default function BuilderPanel() {
  const router = useRouter();
  return (
    <div className="w-80 bg-white h-full p-6 space-y-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900">Sections</h3>
        <button
          type="button"
          onClick={() => router.push("/dashboard/builder")}
          className="p-1.5 bg-indigo-600 rounded-xl text-white hover:bg-indigo-700 transition-all shadow-sm"
        >
          <Plus size={16} />
        </button>
      </div>
      <div className="space-y-3">
        {sections.map((section) => (
          <div
            key={section}
            className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl cursor-grab active:cursor-grabbing hover:border-indigo-200 hover:bg-white transition-all shadow-sm hover:shadow-md"
          >
            <GripVertical size={16} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">{section}</span>
          </div>
        ))}
      </div>
    </div>
  );
}