"use client";

import { AlertTriangle, Inbox, Loader2, RefreshCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface LoadingStateProps {
  label?: string;
  className?: string;
  /** Compact = inline spinner; full = vertical layout with label. */
  variant?: "compact" | "full";
}

export function LoadingState({
  label = "Loading…",
  className = "",
  variant = "full",
}: LoadingStateProps) {
  if (variant === "compact") {
    return (
      <span
        className={`inline-flex items-center gap-2 text-sm text-gray-500 ${className}`}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        {label}
      </span>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-12 text-center text-gray-500 ${className}`}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 px-6 py-12 text-center ${className}`}
    >
      <Icon className="h-10 w-10 text-gray-300" aria-hidden />
      <p className="mt-3 text-sm font-medium text-gray-900">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
  retryLabel = "Try again",
  className = "",
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500"
          aria-hidden
        />
        <div>
          <p className="font-medium">{title}</p>
          {description && (
            <p className="mt-0.5 text-red-700/80">{description}</p>
          )}
        </div>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {retryLabel}
        </button>
      )}
    </div>
  );
}
