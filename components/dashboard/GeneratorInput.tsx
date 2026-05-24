"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Send } from "lucide-react";

export default function GeneratorInput() {
  const router = useRouter();
  return (
    <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm space-y-6">
      <div className="flex items-center gap-3 text-indigo-600">
        <Sparkles size={24} />
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">AI Resume Engine</h2>
      </div>
      <p className="text-sm text-slate-500 leading-relaxed">Describe your career history, achievements, and goals in plain language. Our AI will transform it into a structured, high-impact resume.</p>
      <div className="relative">
        <textarea
          rows={6}
          placeholder="E.g., I've been a software engineer at Google for 5 years working on Kubernetes and Go. I led a team of 4..."
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none leading-relaxed placeholder:text-slate-400"
        />
        <button
          type="button"
          onClick={() => router.push("/dashboard/generator")}
          className="absolute bottom-4 right-4 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2 font-semibold"
        >
          <span className="text-sm">Generate</span>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}