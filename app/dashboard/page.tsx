"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Sparkles,
  Plus,
  Loader2,
  ArrowUpRight,
  Wand2,
} from "lucide-react";
import QuickActions from "./overview/quick-actions";
import RecentActivity from "./overview/recent-activity";
import { useSubscription } from "@/hooks/useSubscription";
import { useCurrentUser, displayNameOf } from "@/hooks/useCurrentUser";
import { useSession } from "next-auth/react";
import { shouldFetchAuthenticatedApis } from "@/lib/auth-client";
import UpgradeToProButton from "@/components/UpgradeToProButton";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { PageShell, PageHeader, StatCard, Surface, ProgressBar } from "@/components/ui/page-shell";
import { Button } from "@/components/ui/button";

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

  const cvLeft = cvRemaining();
  const aiLeft = aiRemaining();
  const cvMax = Number.isFinite(limits.maxCV) ? limits.maxCV : null;

  const limitReached =
    !isPro && typeof cvLeft === "number" && cvLeft === 0 && !planLoading;

  const greeting = userLoading ? "Welcome back" : displayNameOf(user);

  const completedCount = useMemo(
    () => cvs.filter((c) => c.status === "completed").length,
    [cvs]
  );

  return (
    <PageShell>
      <PageHeader
        eyebrow="Overview"
        title={`Good to see you, ${greeting.split(" ")[0]}`}
        description={
          user?.email
            ? `Manage your CVs and track usage from your workspace.`
            : "Build, refine, and export professional CVs with AI."
        }
        action={
          !isPro && !planLoading ? (
            <UpgradeToProButton label="Upgrade" size="sm" />
          ) : undefined
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total CVs" value={loadingCvs ? "—" : cvs.length} icon={FileText} />
        <StatCard label="Completed" value={loadingCvs ? "—" : completedCount} hint="Ready to export" />
        <StatCard
          label="AI remaining"
          value={aiLeft === "unlimited" ? "∞" : String(aiLeft)}
          icon={Sparkles}
        />
        <StatCard
          label="Plan"
          value={planLoading ? "—" : plan}
          hint={isPro ? "All features" : "Upgrade for more"}
          icon={Wand2}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* CV list — wider column */}
        <Surface className="lg:col-span-3" padding>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">Your CVs</h2>
              <p className="mt-0.5 text-xs text-zinc-500">Recent documents</p>
            </div>
            <Button size="sm" asChild disabled={limitReached}>
              <Link href="/dashboard/builder">
                <Plus className="h-3.5 w-3.5" />
                New CV
              </Link>
            </Button>
          </div>

          {!isPro && cvMax !== null && (
            <div className="mb-5">
              <ProgressBar label="CV usage" value={usage.cvCount} max={cvMax} />
            </div>
          )}

          {loadingCvs ? (
            <LoadingState label="Loading CVs…" />
          ) : error ? (
            <ErrorState description={error} onRetry={() => setReloadKey((k) => k + 1)} />
          ) : cvs.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No CVs yet"
              description="Start with the builder or AI generator."
              action={
                <Button asChild size="sm">
                  <Link href="/dashboard/builder">Create your first CV</Link>
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-black/[0.06]">
              {cvs.slice(0, 6).map((cv) => (
                <li
                  key={cv.id}
                  className="group flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 pr-4">
                    <p className="truncate text-sm font-medium text-zinc-900">{cv.title}</p>
                    <p className="mt-0.5 text-xs capitalize text-zinc-400">
                      {cv.status} ·{" "}
                      {(() => {
                        const d = new Date(cv.updatedAt);
                        return Number.isFinite(d.getTime())
                          ? d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
                          : "—";
                      })()}
                    </p>
                  </div>
                  <Link
                    href="/dashboard/builder"
                    className="flex items-center gap-1 text-xs font-medium text-zinc-500 opacity-0 transition-all group-hover:opacity-100 hover:text-zinc-900"
                  >
                    Edit
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Surface>

        <div className="space-y-6 lg:col-span-2">
          <QuickActions />
        </div>
      </div>

      <RecentActivity cvs={cvs} loading={loadingCvs} />
    </PageShell>
  );
}
