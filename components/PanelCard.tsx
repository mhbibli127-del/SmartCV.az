import React from "react";

interface PanelCardProps {
  title: string;
  description?: string;
  badge?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function PanelCard({
  title,
  description,
  badge,
  icon,
  actions,
  children,
  className = "",
}: PanelCardProps) {
  return (
    <div className={`bg-[#020617] border border-slate-800 rounded-2xl shadow-lg overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
        {icon && <div className="text-blue-500">{icon}</div>}
        <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}