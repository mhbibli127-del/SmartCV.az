"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Sparkles,
  Plus,
  Loader2,
  Crown,
  AlertTriangle,
} from "lucide-react";
import QuickActions from "./overview/quick-actions";
import RecentActivity from "./overview/recent-activity";
import { useSubscription } from "@/hooks/useSubscription";
import { useCurrentUser, displayNameOf } from "@/hooks/useCurrentUser";
import { useSession } from "next-auth/react";
import {
  shouldFetchAuthenticatedApis,
} from "@/lib/auth-client";
import UpgradeToProButton from "@/components/UpgradeToProButton";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";

interface CvItem {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const {
    plan,
    isLoading: planLoading,
    aiRemaining,
    cvRemaining,
    usage,
    limits,
  } = useSubscription();
  const { user, loading: userLoading } = useCurrentUser();
  const { status } = useSession();
  const [cvs, setCvs] = useState<CvItem[]>([]);
  const [loadingCvs, setLoadingCvs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const isPro = plan === "pro";

  useEffect(() => {
    if (status === "loading") return;
    if (!shouldFetchAuthenticatedApis(status)) {
      setLoadingCvs(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoadingCvs(true);
      setError(null);
      try {
        const res = await fetch("/api/cv/list", { credentials: "include" });
        if (res.status === 401) {
          setError("Session expired. Please sign in again.");
          return;
        }
        if (!res.ok) throw new Error("Failed to load CVs");
        const data = await res.json();
        if (!cancelled) setCvs(Array.isArray(data.cvs) ? data.cvs : []);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load CVs");
        }
      } finally {
        if (!cancelled) setLoadingCvs(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey, status]);

  const aiLeft = aiRemaining();
  const cvLeft = cvRemaining();

  const aiLabel = useMemo(
    () => (aiLeft === "unlimited" ? "Unlimited AI" : `${aiLeft} AI uses left`),
    [aiLeft]
  );
  const cvLabel = useMemo(
    () =>
      cvLeft === "unlimited"
        ? "Unlimited CVs"
        : `${cvLeft} CV slot${cvLeft === 1 ? "" : "s"} left`,
    [cvLeft]
  );

  const limitReached =
    !isPro &&
    typeof cvLeft === "number" &&
    cvLeft === 0 &&
    !planLoading;

  const greeting = userLoading
    ? "Welcome back"
    : `Welcome back, ${displayNameOf(user)}`;

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white shadow-lg">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-3xl font-bold">{greeting}</h1>
            <p className="mt-2 text-gray-300">
              {user?.email
                ? `Signed in as ${user.email}`
                : "Build, manage, and export your CVs with AI assistance."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {planLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            ) : (
              <span
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${
                  isPro
                    ? "bg-white/15 text-white ring-1 ring-white/20"
                    : "bg-amber-500/20 text-amber-100 ring-1 ring-amber-400/30"
                }`}
              >
                {isPro && <Crown size={16} />}
                {isPro ? "Pro Plan" : "Free Plan"}
              </span>
            )}
            {!isPro && !planLoading && (
              <UpgradeToProButton label="Upgrade to Pro" />
            )}
          </div>
        </div>
        {!isPro && !planLoading && (
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-300">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles size={14} /> {aiLabel}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FileText size={14} />
              {Number.isFinite(limits.maxCV)
                ? `${usage.cvCount}/${limits.maxCV} CVs used`
                : cvLabel}
            </span>
          </div>
        )}
        {limitReached && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-100 ring-1 ring-amber-400/30">
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
            <span>
              You&apos;ve used your free CV slot. Upgrade to Pro to create
              unlimited CVs.
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Your CVs</h2>
            <Link
              href="/dashboard/builder"
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
              aria-disabled={limitReached}
              onClick={(e) => {
                if (limitReached) e.preventDefault();
              }}
            >
              <Plus size={14} /> New CV
            </Link>
          </div>

          {loadingCvs ? (
            <LoadingState label="Loading your CVs…" />
          ) : error ? (
            <ErrorState
              title="Couldn't load your CVs"
              description={error}
              onRetry={() => setReloadKey((k) => k + 1)}
            />
          ) : cvs.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No CVs yet"
              description="Create your first CV with the builder or AI generator."
              action={
                <Link
                  href="/dashboard/builder"
                  className="inline-block rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  Start building
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-gray-100">
              {cvs.slice(0, 5).map((cv) => (
                <li
                  key={cv.id}
                  className="flex items-center justify-between py-3 first:pt-0"
                >
                  <div className="min-w-0 pr-3">
                    <p className="truncate font-medium text-gray-900">
                      {cv.title}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {cv.status} ·{" "}
                      {(() => {
                        const d = new Date(cv.updatedAt);
                        return Number.isFinite(d.getTime())
                          ? d.toLocaleDateString()
                          : "—";
                      })()}
                    </p>
                  </div>
                  <Link
                    href="/dashboard/builder"
                    className="flex-shrink-0 text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    Edit
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <QuickActions />
      </div>

      <RecentActivity cvs={cvs} loading={loadingCvs} />
    </div>
  );
}
