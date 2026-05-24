"use client";

import { useEffect, useMemo, useState } from "react";

type EventItem = {
  _id?: string;
  userId?: unknown;
  eventType: string;
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: string | Date;
};

export default function AdminEventsPage() {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventType, setEventType] = useState("");
  const [userId, setUserId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (eventType.trim()) params.set("eventType", eventType.trim());
    if (userId.trim()) params.set("userId", userId.trim());
    return params.toString();
  }, [eventType, userId]);

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    try {
      const qs = queryString ? `?${queryString}` : "";
      const res = await fetch(`/api/events${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load events");
      setEvents(Array.isArray(data?.events) ? data.events : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">System Activity</h1>
            <p className="mt-1 text-sm text-gray-600">Review events recorded across the application.</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-1">
              <label className="text-sm font-medium text-gray-700">Event type</label>
              <input
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                placeholder="e.g. CV_CREATED"
              />
            </div>
            <div className="md:col-span-1">
              <label className="text-sm font-medium text-gray-700">User ID</label>
              <input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                placeholder="e.g. 123"
              />
            </div>
            <div className="md:col-span-1 flex items-end">
              <button
                onClick={fetchEvents}
                disabled={loading}
                className="w-full rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Loading…" : "Filter"}
              </button>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          ) : null}

          <div className="mt-5 overflow-auto">
            <table className="min-w-[800px] w-full border-separate border-spacing-0">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="border-b border-gray-200 p-3">Event Type</th>
                  <th className="border-b border-gray-200 p-3">Message</th>
                  <th className="border-b border-gray-200 p-3">User ID</th>
                  <th className="border-b border-gray-200 p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-sm text-gray-600">
                      No events found.
                    </td>
                  </tr>
                ) : (
                  events.map((ev, idx) => (
                    <tr key={(ev._id ?? ev.createdAt ?? idx).toString()} className="hover:bg-gray-50">
                      <td className="border-b border-gray-100 p-3 text-sm font-medium text-gray-900">
                        {ev.eventType}
                      </td>
                      <td className="border-b border-gray-100 p-3 text-sm text-gray-700">
                        {ev.message}
                      </td>
                      <td className="border-b border-gray-100 p-3 text-sm text-gray-600">
                        {typeof ev.userId === "object" ? JSON.stringify(ev.userId) : String(ev.userId ?? "—")}
                      </td>
                      <td className="border-b border-gray-100 p-3 text-sm text-gray-600">
                        {new Date(ev.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

