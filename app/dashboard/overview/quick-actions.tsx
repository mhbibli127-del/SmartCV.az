"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FileEdit, Wand2, Library, TrendingUp } from "lucide-react";

type ActionColor = "blue" | "purple" | "green" | "orange";

// Tailwind purges classes it can't see literally in the source — never
// interpolate class names like `bg-${color}-100`. Pre-resolve them here.
const COLOR_CLASSES: Record<ActionColor, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-100", text: "text-blue-600" },
  purple: { bg: "bg-purple-100", text: "text-purple-600" },
  green: { bg: "bg-green-100", text: "text-green-600" },
  orange: { bg: "bg-orange-100", text: "text-orange-600" },
};

interface ActionItem {
  icon: typeof FileEdit;
  label: string;
  description: string;
  href: string;
  color: ActionColor;
}

const ACTIONS: ActionItem[] = [
  {
    icon: FileEdit,
    label: "Create New CV",
    description: "Start from scratch",
    href: "/dashboard/builder",
    color: "blue",
  },
  {
    icon: Wand2,
    label: "AI Generator",
    description: "Generate with AI",
    href: "/dashboard/generator",
    color: "purple",
  },
  {
    icon: Library,
    label: "Browse Templates",
    description: "50+ templates",
    href: "/dashboard/examples",
    color: "green",
  },
  {
    icon: TrendingUp,
    label: "View Analytics",
    description: "Track performance",
    href: "/dashboard/analytics",
    color: "orange",
  },
];

export default function QuickActions() {
  const router = useRouter();

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
        <button
          type="button"
          onClick={() => router.push("/dashboard/builder")}
          className="text-sm text-black font-semibold hover:text-gray-700 transition-colors"
        >
          View All
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          const colors = COLOR_CLASSES[action.color];
          return (
            <button
              key={action.label}
              type="button"
              onClick={() => router.push(action.href)}
              className="group p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all text-left"
            >
              <div
                className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
              >
                <Icon size={20} className={colors.text} />
              </div>
              <p className="font-semibold text-gray-900 text-sm">
                {action.label}
              </p>
              <p className="text-xs text-gray-500 mt-1">{action.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
