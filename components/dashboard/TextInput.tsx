"use client";
import React from "react";

interface TextInputProps {
  label: string;
  placeholder: string;
  type?: string;
}

export default function TextInput({ label, placeholder, type = "text" }: TextInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
      />
    </div>
  );
}