"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Eye, Download, FileText, Sparkles, Activity } from "lucide-react";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { PageShell, PageHeader, StatCard, Surface } from "@/components/ui/page-shell";

const COLORS = ["#18181b", "#52525b", "#71717a", "#a1a1aa", "#d4d4d8"];

interface AnalyticsData {
  range: string;
  totalViews: number;
  totalDownloads: number;
  totalCVs: number;
  aiUsage: number;
  conversionRate: number;
  chartData: { name: string; views: number; downloads: number }[];
  featureUsage: { name: string; value: number }[];
  recentActivity: { action: string; page: string; time: string }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState("7d");

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analytics?range=${range}`, { credentials: "include" });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load analytics");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) return <LoadingState label="Loading analytics…" className="h-96" />;
  if (error) {
    return (
      <ErrorState title="Couldn't load analytics" description={error} onRetry={fetchAnalytics} />
    );
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Insights"
        title="Your analytics"
        description="Track CV activity, exports, and feature usage across your workspace."
        action={
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="h-10 rounded-[12px] border border-black/[0.08] bg-white px-3 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Page views" value={data?.totalViews ?? 0} icon={Eye} />
        <StatCard label="Exports" value={data?.totalDownloads ?? 0} icon={Download} />
        <StatCard label="Total CVs" value={data?.totalCVs ?? 0} icon={FileText} />
        <StatCard label="AI actions" value={data?.aiUsage ?? 0} icon={Sparkles} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Surface padding>
          <h3 className="text-sm font-semibold text-zinc-900">Activity over time</h3>
          <p className="mt-0.5 text-xs text-zinc-500">Views vs exports</p>
          <div className="mt-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.chartData ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="views" fill="#18181b" name="Views" radius={[4, 4, 0, 0]} />
                <Bar dataKey="downloads" fill="#71717a" name="Exports" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Surface>

        <Surface padding>
          <h3 className="text-sm font-semibold text-zinc-900">Feature usage</h3>
          <p className="mt-0.5 text-xs text-zinc-500">Where you spend time</p>
          <div className="mt-4 h-[280px]">
            {(data?.featureUsage ?? []).length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                No feature usage recorded in this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.featureUsage ?? []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                    }
                  >
                    {(data?.featureUsage ?? []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Surface>
      </div>

      <Surface padding>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Recent activity</h3>
            <p className="mt-0.5 text-xs text-zinc-500">Your latest interactions</p>
          </div>
          <span className="text-xs text-zinc-400">
            {data?.conversionRate ?? 0}% export rate
          </span>
        </div>
        {(data?.recentActivity ?? []).length === 0 ? (
          <div className="py-12 text-center">
            <Activity className="mx-auto h-8 w-8 text-zinc-300" />
            <p className="mt-3 text-sm text-zinc-500">No activity recorded yet.</p>
            <p className="mt-1 text-xs text-zinc-400">
              Use the builder, generator, or examples to see insights here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-black/[0.06]">
            {data?.recentActivity.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 first:pt-0">
                <div>
                  <p className="text-sm font-medium capitalize text-zinc-900">{item.action}</p>
                  <p className="text-xs text-zinc-400">{item.page}</p>
                </div>
                <span className="text-xs tabular-nums text-zinc-400">
                  {new Date(item.time).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </Surface>
    </PageShell>
  );
}
