"use client";
import React from "react";
import { Eye, Download } from "lucide-react";

interface ExampleCardProps {
  title: string;
  category: string;
}

export default function ExampleCard({ title, category }: ExampleCardProps) {
  return (
    <div className="bg-[#020617] border border-slate-800 rounded-2xl overflow-hidden group hover:border-slate-700 transition-all">
      <div className="aspect-[3/4] bg-slate-900 relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-slate-950/60 transition-opacity gap-3">
          <button className="p-3 bg-white text-slate-950 rounded-full hover:scale-110 transition-transform"><Eye size={20} /></button>
          <button className="p-3 bg-blue-600 text-white rounded-full hover:scale-110 transition-transform"><Download size={20} /></button>
        </div>
      </div>
      <div className="p-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">{category}</span>
        <h4 className="text-white font-semibold mt-1">{title}</h4>
      </div>
    </div>
  );
} 