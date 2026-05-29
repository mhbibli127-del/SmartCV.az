"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { captureExceptionSafe } from "@/lib/sentry/safe-capture";

interface ErrorBoundaryProps {
  children: ReactNode;
  title?: string;
  description?: string;
  homeHref?: string;
  homeLabel?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/** Catches client render errors so the app shows a recovery UI instead of a blank screen. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    captureExceptionSafe(error);
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  private reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const {
      title = "Something went wrong",
      description = "This section failed to load. You can retry or return to a safe page.",
      homeHref = "/dashboard",
      homeLabel = "Go to dashboard",
    } = this.props;

    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
          <p className="mt-2 text-sm text-zinc-500">{description}</p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={this.reset}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
            <Link
              href={homeHref}
              className="inline-flex items-center justify-center rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              {homeLabel}
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
