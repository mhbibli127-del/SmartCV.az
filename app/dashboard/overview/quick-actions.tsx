"use client";

import { useRouter } from "next/navigation";
import { FileEdit, Sparkles, Library, TrendingUp, ArrowUpRight } from "lucide-react";
import { Surface } from "@/components/ui/page-shell";

const ACTIONS = [
  {
    icon: FileEdit,
    label: "My CVs",
    description: "Create or edit",
    href: "/dashboard/builder",
  },
  {
    icon: Sparkles,
    label: "Templates",
    description: "Pick a design",
    href: "/dashboard/studio",
  },
  {
    icon: Library,
    label: "Examples",
    description: "Browse profiles",
    href: "/dashboard/examples",
  },
  {
    icon: TrendingUp,
    label: "Analytics",
    description: "ATS & activity",
    href: "/dashboard/analytics",
  },
];

export default function QuickActions() {
  const router = useRouter();

  return (
    <Surface padding>
      <h3 className="text-sm font-semibold text-zinc-900">Quick actions</h3>
      <p className="mt-0.5 text-xs text-zinc-500">Start where you left off</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              type="button"
              onClick={() => router.push(action.href)}
              className="group flex flex-col items-start rounded-[12px] border border-black/[0.06] bg-zinc-50/50 p-3.5 text-left transition-all duration-200 hover:border-black/[0.1] hover:bg-white hover:shadow-sm"
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-white shadow-sm ring-1 ring-black/[0.06]">
                  <Icon className="h-4 w-4 text-zinc-600" />
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-zinc-300 transition-all group-hover:text-zinc-500" />
              </div>
              <p className="mt-3 text-[13px] font-medium text-zinc-900">{action.label}</p>
              <p className="mt-0.5 text-xs text-zinc-400">{action.description}</p>
            </button>
          );
        })}
      </div>
    </Surface>
  );
}
