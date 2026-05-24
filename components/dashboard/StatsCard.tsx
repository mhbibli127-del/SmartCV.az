"use client";
import React from "react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
}

export default function StatsCard({ title, value, icon, trend }: StatsCardProps) {
  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 bg-indigo-50 rounded-2xl text-indigo-600">{icon}</div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{trend}</span>
      </div>
      <h4 className="text-slate-500 text-sm font-medium">{title}</h4>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
}