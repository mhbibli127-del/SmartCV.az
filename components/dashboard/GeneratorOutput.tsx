"use client";
import React from "react";
import { Loader2, Wand2 } from "lucide-react";

export default function GeneratorOutput() {
  return (
    <div className="bg-white border border-slate-200 p-8 rounded-3xl min-h-[400px] flex flex-col shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
          <Wand2 size={12} /> AI Result
        </div>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <div className="w-2 h-2 rounded-full bg-slate-700"></div>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
        <Loader2 size={32} className="text-indigo-600 animate-spin" />
        <p className="text-slate-500 text-sm max-w-xs leading-relaxed font-medium">AI is currently refining your career bullet points and structure...</p>
      </div>
    </div>
  );
}