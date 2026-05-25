"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Clock, FileText, Loader2 } from "lucide-react";
import { Surface } from "@/components/ui/page-shell";

interface CvItem {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
}

interface RecentActivityProps {
  cvs?: CvItem[];
  loading?: boolean;
}

function formatRelative(dateStr: string): string {
  const d = new Date(dateStr);
  if (!Number.isFinite(d.getTime())) return "—";
  const diff = Date.now() - d.getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return "just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function RecentActivity({ cvs, loading }: RecentActivityProps) {
  const router = useRouter();

  const activities = useMemo(() => {
    if (!Array.isArray(cvs)) return [];
    return cvs
      .slice()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 6)
      .map((cv) => ({
        id: cv.id,
        title: cv.title,
        description: cv.status === "completed" ? "Marked complete" : "Saved as draft",
        time: formatRelative(cv.updatedAt),
      }));
  }, [cvs]);

  return (
    <Surface padding>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">Recent activity</h3>
          <p className="mt-0.5 text-xs text-zinc-500">Latest changes to your CVs</p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/dashboard/analytics")}
          className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900"
        >
          View all
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10 text-zinc-300">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : activities.length === 0 ? (
        <div className="rounded-[12px] border border-dashed border-black/[0.08] py-12 text-center">
          <Clock className="mx-auto h-7 w-7 text-zinc-300" />
          <p className="mt-3 text-sm font-medium text-zinc-700">No activity yet</p>
          <p className="mt-1 text-xs text-zinc-400">Your edits will appear here.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-3 rounded-[10px] px-2 py-2.5 transition-colors hover:bg-zinc-50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-zinc-100">
                <FileText className="h-3.5 w-3.5 text-zinc-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-zinc-900">
                  {activity.title}
                </p>
                <p className="text-xs text-zinc-400">{activity.description}</p>
              </div>
              <span className="shrink-0 text-xs tabular-nums text-zinc-400">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      )}
    </Surface>
  );
}
