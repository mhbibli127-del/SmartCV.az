"use client";

import { useCallback } from "react";
import { signOut } from "next-auth/react";
import { forceLogoutToLogin } from "@/lib/auth-redirect";

export function useLogout() {
  const logout = useCallback(async () => {
    try {
      await signOut({ redirect: false });
    } catch (error) {
      console.error("Failed to clear OAuth session:", error);
    }

    await forceLogoutToLogin("logout");
  }, []);

  return { logout };
}
