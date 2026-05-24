"use client";
import React from "react";
import Link from "next/link";
import { Search, Bell } from "lucide-react";

export default function Navbar() {
  return (
    <header className="h-16 border-b border-slate-800 bg-[#020617]/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
        <input
          type="text"
          placeholder="Search for something..."
          className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/settings"
          className="p-2 text-slate-400 hover:bg-slate-800 rounded-full transition-colors"
          aria-label="Notifications"
        >
          <Bell size={20} />
        </Link>
        <Link href="/dashboard/account" className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm text-white">U</div>
        </Link>
      </div>
    </header>
  );
}