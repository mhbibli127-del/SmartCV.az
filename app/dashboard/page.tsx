"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Sparkles,
  Plus,
  ArrowUpRight,
  Wand2,
  Trash2,
  LayoutTemplate,
  Loader2,
  Target,
} from "lucide-react";
import QuickActions from "./overview/quick-actions";
import RecentActivity from "./overview/recent-activity";
import { useSubscription } from "@/hooks/useSubscription";
import { useAnalytics } from "@/lib/analytics";
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
  mode?: string;
}

export default function DashboardPage() {
  const {
    plan,
    isLoading: planLoading,
    aiRemaining,
    cvRemaining,
    usage,
    limits,
    openUpgradeModal,
    refreshSubscription,
  } = useSubscription();
  const { user, loading: userLoading } = useCurrentUser();
  const { status } = useSession();
  const { trackPageView } = useAnalytics();
  const [cvs, setCvs] = useState<CvItem[]>([]);
  const [loadingCvs, setLoadingCvs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [userStats, setUserStats] = useState<{
    profileViews: number;
    atsScore: number;
    lastEdited: string;
  } | null>(null);

  const isPro = plan === "pro" || plan === "basic";

  useEffect(() => {
    trackPageView("/dashboard");
  }, [trackPageView]);

  useEffect(() => {
    if (status === "loading") return;
    if (!shouldFetchAuthenticatedApis(status)) return;
    let cancelled = false;
    fetch("/api/user/stats", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) {
          setUserStats({
            profileViews: data.profileViews ?? 0,
            atsScore: data.atsScore ?? 0,
            lastEdited: data.lastEdited ?? "Never",
          });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [status]);

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
    plan === "free" && typeof cvLeft === "number" && cvLeft === 0 && !planLoading;

  const greeting = userLoading ? "Welcome back" : displayNameOf(user);

  const handleCreateCV = async () => {
    if (limitReached) {
      openUpgradeModal();
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/cv", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "CV_LIMIT_REACHED") openUpgradeModal();
        throw new Error(data.error);
      }
      window.location.href = `/dashboard/builder?id=${data.cvId}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create CV");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCV = async (id: string) => {
    if (!confirm("Delete this CV? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/cv/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
      setCvs((prev) => prev.filter((c) => c.id !== id));
      refreshSubscription();
    } catch {
      setError("Could not delete CV");
    } finally {
      setDeletingId(null);
    }
  };

  const editHref = (cv: CvItem) =>
    cv.mode === "visual"
      ? `/dashboard/builder/editor?id=${cv.id}`
      : `/dashboard/builder?id=${cv.id}`;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Overview"
        title={`Good to see you, ${greeting.split(" ")[0]}`}
        description="Manage your CVs and track usage from your workspace."
        action={
          !isPro && !planLoading ? (
            <UpgradeToProButton label="Upgrade" size="sm" />
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total CVs" value={loadingCvs ? "—" : cvs.length} icon={FileText} />
        <StatCard
          label="ATS readiness"
          value={userStats ? `${userStats.atsScore}%` : "—"}
          icon={Target}
          hint={userStats?.lastEdited ? `Last edit ${userStats.lastEdited}` : undefined}
        />
        <StatCard
          label="AI remaining"
          value={aiLeft === "unlimited" ? "∞" : String(aiLeft)}
          icon={Sparkles}
        />
        <StatCard
          label="Plan"
          value={planLoading ? "—" : plan}
          hint={isPro ? "All features" : "Upgrade for AI"}
          icon={Wand2}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Surface className="lg:col-span-3" padding>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">Your CVs</h2>
              <p className="mt-0.5 text-xs text-zinc-500">Recent documents</p>
            </div>
            <Button size="sm" onClick={handleCreateCV} disabled={limitReached || creating}>
              {creating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              New CV
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
                <Button size="sm" onClick={handleCreateCV} disabled={creating}>
                  Create your first CV
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-black/[0.06]">
              {cvs.map((cv) => (
                <li
                  key={cv.id}
                  className="group flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900">{cv.title}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs capitalize text-zinc-400">
                      <span>{cv.status}</span>
                      <span>·</span>
                      <span>
                        {new Date(cv.updatedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {cv.mode === "visual" && (
                        <>
                          <span>·</span>
                          <LayoutTemplate className="inline h-3 w-3" />
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={editHref(cv)}>
                        Edit
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                      disabled={deletingId === cv.id}
                      onClick={() => handleDeleteCV(cv.id)}
                    >
                      {deletingId === cv.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Surface>

        <div className="space-y-6 lg:col-span-2">
          <QuickActions />
        </div>
      </div>

      <RecentActivity cvs={cvs} loading={loadingCvs} editHref={editHref} />
    </PageShell>
  );
}
