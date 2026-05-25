import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";
export function PageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("animate-page-enter space-y-8", className)}>{children}</div>
  );
}

/** Section header — Notion-style hierarchy */
export function PageHeader({
  title,
  description,
  action,
  eyebrow,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1.5">
        {eyebrow && (
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-xl text-sm leading-relaxed text-zinc-500">{description}</p>
        )}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}

/** Stat card — Vercel dashboard style */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="group rounded-[14px] border border-black/[0.08] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</p>
        {Icon && (
          <Icon className="h-4 w-4 text-zinc-300 transition-colors group-hover:text-zinc-400" />
        )}
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

/** Soft progress bar */
export function ProgressBar({
  value,
  max,
  label,
  showValues = true,
}: {
  value: number;
  max: number;
  label?: string;
  showValues?: boolean;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const isHigh = pct >= 90;

  return (
    <div className="space-y-2">
      {(label || showValues) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="font-medium text-zinc-600">{label}</span>}
          {showValues && (
            <span className="tabular-nums text-zinc-400">
              {value} / {max}
            </span>
          )}
        </div>
      )}
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            isHigh ? "bg-amber-500" : "bg-zinc-900"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** Surface card — base container */
export function Surface({
  children,
  className,
  padding = true,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  padding?: boolean;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[14px] border border-black/[0.08] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
        padding && "p-6",
        hover && "hover-lift",
        className
      )}
    >
      {children}
    </div>
  );
}
