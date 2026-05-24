"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { clearAuthStorage, clearServerAuthSession } from "@/lib/logout";

export function useLogout() {
  const router = useRouter();

  const logout = useCallback(async () => {
    try {
      await clearServerAuthSession();
    } catch (error) {
      console.error("Failed to clear server session:", error);
    }

    try {
      await signOut({ redirect: false });
    } catch (error) {
      console.error("Failed to clear OAuth session:", error);
    }

    clearAuthStorage();
    router.push("/login");
    router.refresh();
  }, [router]);

  return { logout };
}
