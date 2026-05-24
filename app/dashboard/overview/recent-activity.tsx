"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Clock, FileText, Loader2 } from "lucide-react";

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
  if (diff < hour) return `${Math.floor(diff / minute)} min ago`;
  if (diff < day) return `${Math.floor(diff / hour)} hours ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)} days ago`;
  return d.toLocaleDateString();
}

export default function RecentActivity({ cvs, loading }: RecentActivityProps) {
  const router = useRouter();

  const activities = useMemo(() => {
    if (!Array.isArray(cvs)) return [];
    return cvs
      .slice()
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 5)
      .map((cv) => ({
        id: cv.id,
        title:
          cv.status === "completed"
            ? `Completed ${cv.title}`
            : `Saved ${cv.title}`,
        description:
          cv.status === "completed" ? "Marked as completed" : "Saved as draft",
        time: formatRelative(cv.updatedAt),
      }));
  }, [cvs]);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
        <button
          type="button"
          onClick={() => router.push("/dashboard/analytics")}
          className="text-sm text-black font-semibold hover:text-gray-700 transition-colors"
        >
          View All
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : activities.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center">
          <Clock className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-900">
            No activity yet
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Save or complete a CV to see it appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <FileText size={18} className="text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {activity.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {activity.description}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                <Clock size={12} />
                <span>{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
