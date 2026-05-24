"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Palette, Share2, Printer, History } from "lucide-react";

const tools = [
  { name: "Appearance", icon: Palette, href: "/dashboard/settings" },
  { name: "Share Link", icon: Share2, href: "/dashboard/account" },
  { name: "Print to PDF", icon: Printer, href: "/dashboard/builder" },
  { name: "Version History", icon: History, href: "/dashboard/analytics" },
];

export default function ToolsPanel() {
  const router = useRouter();
  return (
    <div className="grid grid-cols-2 gap-4">
      {tools.map((tool) => (
        <button
          key={tool.name}
          type="button"
          onClick={() => router.push(tool.href)}
          className="flex flex-col items-center justify-center p-6 bg-[#020617] border border-slate-800 rounded-2xl gap-3 group hover:border-blue-500/50 transition-all"
        >
          <tool.icon className="text-slate-500 group-hover:text-blue-400 transition-colors" size={24} />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{tool.name}</span>
        </button>
      ))}
    </div>
  );
}