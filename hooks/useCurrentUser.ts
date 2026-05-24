"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { hasAuthStateCookie, shouldFetchAuthenticatedApis } from "@/lib/auth-client";

export interface CurrentUser {
  email: string;
  name: string | null;
}

interface UseCurrentUserResult {
  user: CurrentUser | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

let cachedUser: CurrentUser | null = null;
let inflight: Promise<CurrentUser | null> | null = null;
const listeners = new Set<(u: CurrentUser | null) => void>();

async function fetchCurrentUser(): Promise<CurrentUser | null> {
  if (!hasAuthStateCookie()) {
    cachedUser = null;
    listeners.forEach((cb) => cb(null));
    return null;
  }
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) return null;
      const data = (await res.json()) as Partial<CurrentUser>;
      if (!data?.email) return null;
      const next: CurrentUser = {
        email: String(data.email).toLowerCase().trim(),
        name: data.name ?? null,
      };
      cachedUser = next;
      listeners.forEach((cb) => cb(next));
      return next;
    } catch {
      return null;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

export function useCurrentUser(): UseCurrentUserResult {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<CurrentUser | null>(cachedUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const listener = (u: CurrentUser | null) => {
      if (!cancelled) setUser(u);
    };
    listeners.add(listener);

    if (status === "loading") {
      return () => {
        cancelled = true;
        listeners.delete(listener);
      };
    }

    if (status === "authenticated" && session?.user?.email) {
      const next: CurrentUser = {
        email: session.user.email.toLowerCase().trim(),
        name: session.user.name ?? null,
      };
      cachedUser = next;
      setUser(next);
      setLoading(false);
      return () => {
        cancelled = true;
        listeners.delete(listener);
      };
    }

    if (!shouldFetchAuthenticatedApis(status)) {
      setUser(null);
      setLoading(false);
      return () => {
        cancelled = true;
        listeners.delete(listener);
      };
    }

    fetchCurrentUser()
      .then((u) => {
        if (cancelled) return;
        if (!u) setError("Unauthorized");
        setUser(u);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Failed to load user");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      listeners.delete(listener);
    };
  }, [session, status]);

  return {
    user,
    loading,
    error,
    refresh: async () => {
      cachedUser = null;
      await fetchCurrentUser();
    },
  };
}

export function displayNameOf(user: CurrentUser | null): string {
  if (!user) return "there";
  if (user.name && user.name.trim()) return user.name.trim();
  const prefix = user.email.split("@")[0] ?? "";
  if (!prefix) return "there";
  return prefix.charAt(0).toUpperCase() + prefix.slice(1);
}

export function initialOf(user: CurrentUser | null): string {
  const display = displayNameOf(user);
  return (display[0] ?? "U").toUpperCase();
}
