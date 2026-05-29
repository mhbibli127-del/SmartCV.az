"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Check, AlertTriangle, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import type { AppNotification } from "@/lib/notifications";
import { shouldFetchAuthenticatedApis } from "@/lib/auth-client";
import { isAuthVerificationSettled } from "@/lib/auth-verification-state";
import { useSession } from "next-auth/react";

type NotificationPanelProps = {
  onUnreadChange?: (count: number) => void;
};

export default function NotificationPanel({
  onUnreadChange,
}: NotificationPanelProps) {
  const { status } = useSession();
  const onUnreadRef = useRef(onUnreadChange);
  onUnreadRef.current = onUnreadChange;

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const initialLoadDoneRef = useRef(false);
  const pollStartedRef = useRef(false);

  const loadNotifications = useCallback(async () => {
    if (!shouldFetchAuthenticatedApis(status)) {
      setNotifications([]);
      setUnreadCount(0);
      setError(null);
      setLoading(false);
      return;
    }

    if (status !== "authenticated" && !isAuthVerificationSettled()) {
      return;
    }

    setLoading(true);
    try {
      const { ok, status: httpStatus, data } = await api.get<{
        notifications: AppNotification[];
        unreadCount: number;
      }>("/api/notifications");

      if (ok) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
        onUnreadRef.current?.(data.unreadCount || 0);
        setError(null);
      } else if (httpStatus === 401) {
        setNotifications([]);
        setUnreadCount(0);
        setError(null);
      } else {
        setError("Could not load notifications");
      }
    } catch {
      setError("Could not load notifications");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (status === "loading") return;
    if (!shouldFetchAuthenticatedApis(status)) return;
    if (status !== "authenticated" && !isAuthVerificationSettled()) return;
    if (initialLoadDoneRef.current) return;

    initialLoadDoneRef.current = true;
    void loadNotifications();
  }, [status, loadNotifications]);

  useEffect(() => {
    if (status === "loading") return;
    if (!shouldFetchAuthenticatedApis(status)) return;
    if (status !== "authenticated" && !isAuthVerificationSettled()) return;
    if (pollStartedRef.current) return;

    pollStartedRef.current = true;
    let interval: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (interval) return;
      interval = setInterval(() => void loadNotifications(), 30_000);
    };
    const stop = () => {
      if (!interval) return;
      clearInterval(interval);
      interval = null;
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void loadNotifications();
        start();
      } else {
        stop();
      }
    };

    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [status, loadNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const markAllRead = async () => {
    await api.patch("/api/notifications", { ids: undefined });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    onUnreadRef.current?.(0);
  };

  const handleToggle = () => {
    setOpen((prev) => !prev);
    if (!open) void loadNotifications();
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative p-3 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 min-w-[8px] h-2 px-1 bg-black rounded-full text-[10px] text-white flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-gray-600 hover:text-black flex items-center gap-1"
              >
                <Check size={14} />
                Mark all read
              </button>
            )}
          </div>
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading…
              </div>
            ) : error ? (
              <div className="flex items-start gap-2 px-4 py-4 text-sm text-red-700">
                <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-500 text-center">
                No notifications yet
              </p>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`px-4 py-3 ${item.read ? "bg-white" : "bg-gray-50"}`}
                >
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{item.message}</p>
                  <p className="text-[10px] text-gray-400 mt-2">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
