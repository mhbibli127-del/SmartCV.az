"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { hasAuthStateCookie, shouldFetchAuthenticatedApis } from "@/lib/auth-client";
import { isTransientApiFailure, parseJsonSafe } from "@/lib/auth-api-client";

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
let lastTransientFailureAt = 0;
const listeners = new Set<(u: CurrentUser | null) => void>();

const TRANSIENT_COOLDOWN_MS = 60_000;

async function fetchCurrentUser(force = false): Promise<CurrentUser | null> {
  if (!hasAuthStateCookie()) {
    cachedUser = null;
    listeners.forEach((cb) => cb(null));
    return null;
  }

  if (
    !force &&
    Date.now() - lastTransientFailureAt < TRANSIENT_COOLDOWN_MS &&
    cachedUser
  ) {
    return cachedUser;
  }

  if (!force && Date.now() - lastTransientFailureAt < TRANSIENT_COOLDOWN_MS) {
    return cachedUser;
  }

  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });

      if (isTransientApiFailure(res.status)) {
        lastTransientFailureAt = Date.now();
        return cachedUser;
      }

      if (!res.ok) {
        if (res.status === 401) {
          cachedUser = null;
          listeners.forEach((cb) => cb(null));
        }
        return cachedUser;
      }

      const data = await parseJsonSafe<Partial<CurrentUser>>(res);
      if (!data?.email) {
        return cachedUser;
      }

      const next: CurrentUser = {
        email: String(data.email).toLowerCase().trim(),
        name: data.name ?? null,
      };
      cachedUser = next;
      lastTransientFailureAt = 0;
      listeners.forEach((cb) => cb(next));
      return next;
    } catch {
      lastTransientFailureAt = Date.now();
      return cachedUser;
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

  const refresh = useCallback(async () => {
    cachedUser = null;
    lastTransientFailureAt = 0;
    await fetchCurrentUser(true);
  }, []);

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
      setError(null);
      return () => {
        cancelled = true;
        listeners.delete(listener);
      };
    }

    if (!shouldFetchAuthenticatedApis(status)) {
      setUser(null);
      setLoading(false);
      setError(null);
      return () => {
        cancelled = true;
        listeners.delete(listener);
      };
    }

    void fetchCurrentUser()
      .then((u) => {
        if (cancelled) return;
        setUser(u);
        setError(null);
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
  }, [status, session?.user?.email, session?.user?.name]);

  return {
    user,
    loading,
    error,
    refresh,
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
