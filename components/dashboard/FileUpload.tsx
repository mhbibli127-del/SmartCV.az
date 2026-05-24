"use client";
import React, { useRef } from "react";
import { UploadCloud } from "lucide-react";

export default function FileUpload() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleBrowse = () => inputRef.current?.click();

  return (
    <div className="group relative border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-2xl p-10 flex flex-col items-center justify-center bg-slate-900/20 transition-all cursor-pointer">
      <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" className="absolute inset-0 opacity-0 cursor-pointer" />
      <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
        <UploadCloud size={32} />
      </div>
      <p className="text-slate-200 font-semibold">Drop your current CV here</p>
      <p className="text-slate-500 text-xs mt-2 text-center max-w-[200px]">
        Support PDF, DOCX (Max 5MB). AI will extract your data automatically.
      </p>
      <button
        type="button"
        onClick={handleBrowse}
        className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors border border-slate-700"
      >
        Browse Files
      </button>
    </div>
  );
}