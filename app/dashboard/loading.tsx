export default function DashboardLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="h-32 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-64 rounded-xl border border-gray-200 bg-gray-50 animate-pulse" />
        <div className="h-64 rounded-xl border border-gray-200 bg-gray-50 animate-pulse" />
      </div>
      <div className="h-48 rounded-2xl border border-gray-200 bg-gray-50 animate-pulse" />
      <span className="sr-only">Loading dashboard…</span>
    </div>
  );
}
