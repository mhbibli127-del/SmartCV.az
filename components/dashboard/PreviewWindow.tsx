"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Maximize2, RefreshCw } from "lucide-react";

export default function PreviewWindow() {
  const router = useRouter();
  const [key, setKey] = useState(0);

  return (
    <div className="bg-[#020617] border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-full shadow-2xl">
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Live Preview</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setKey((k) => k + 1)}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
            aria-label="Refresh preview"
          >
            <RefreshCw size={14} />
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/builder")}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
            aria-label="Open full preview"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
      <div key={key} className="flex-1 bg-slate-950 p-6 flex items-start justify-center overflow-y-auto">
        <div className="w-full aspect-[1/1.41] bg-white rounded shadow-inner p-8">
          <div className="w-1/3 h-4 bg-slate-200 rounded mb-4"></div>
          <div className="w-full h-2 bg-slate-100 rounded mb-2"></div>
          <div className="w-full h-2 bg-slate-100 rounded mb-2"></div>
          <div className="w-4/5 h-2 bg-slate-100 rounded mb-8"></div>
        </div>
      </div>
    </div>
  );
}