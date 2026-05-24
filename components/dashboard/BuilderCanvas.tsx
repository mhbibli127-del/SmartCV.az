"use client";
import React from "react";

export default function BuilderCanvas() {
  return (
    <div className="flex-1 bg-slate-100 p-10 overflow-y-auto border-l border-slate-200">
      <div className="max-w-[800px] mx-auto min-h-[1100px] bg-white rounded-md shadow-xl border border-slate-200 p-12 text-slate-900">
        <div className="border-b-2 border-slate-900 pb-6 mb-8 text-center">
          <h1 className="text-3xl font-black uppercase tracking-widest text-slate-900">MURAD HABIBLI</h1>
          <p className="text-slate-500 mt-2 text-sm">Baku, Azerbaijan | +994 50 123 45 67 | murad@example.com</p>
        </div>
        
        <div className="space-y-8">
          <section className="space-y-2">
            <h2 className="text-base font-bold border-b border-slate-200 pb-1 uppercase tracking-wider text-indigo-600">Professional Summary</h2>
            <p className="text-sm leading-relaxed text-slate-700 italic">
              Drop your sections here to start building your professional narrative. Use the sidebar to add or reorder items.
            </p>
          </section>
          <div className="h-48 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 text-sm bg-slate-50 font-medium">Drag sections here</div>
        </div>
      </div>
    </div>
  );
}