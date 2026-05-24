"use client";

import { useCallback, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import GoogleLogo from "@/components/auth/GoogleLogo";
import { useToast } from "@/components/ui/use-toast";

type GoogleSignInButtonProps = {
  callbackUrl?: string;
  className?: string;
};

export default function GoogleSignInButton({
  callbackUrl = "/dashboard",
  className = "",
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/config")
      .then((r) => r.json())
      .then((data: { google?: boolean }) => {
        if (!cancelled) setEnabled(Boolean(data.google));
      })
      .catch(() => {
        if (!cancelled) setEnabled(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleClick = useCallback(async () => {
    if (loading) return;

    if (enabled === false) {
      toast({
        title: "Google sign-in unavailable",
        description:
          "Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local, then restart the dev server.",
        variant: "error",
      });
      return;
    }

    setLoading(true);
    try {
      await signIn("google", { callbackUrl, redirect: true });
    } catch {
      setLoading(false);
      toast({
        title: "Google sign-in failed",
        description: "Could not start Google authentication. Please try again.",
        variant: "error",
      });
    }
  }, [callbackUrl, enabled, loading, toast]);

  if (enabled === null) {
    return (
      <div
        className={`h-[48px] w-full animate-pulse rounded-xl bg-gray-100 ${className}`}
        aria-hidden="true"
      />
    );
  }

  if (!enabled) {
    return (
      <p className={`text-center text-xs text-gray-400 ${className}`}>
        Google sign-in is not configured. Add OAuth credentials to{" "}
        <code className="rounded bg-gray-100 px-1 py-0.5 text-[10px]">.env.local</code>.
      </p>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.01 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={[
        "group relative flex h-12 w-full items-center justify-center gap-3",
        "rounded-xl border border-[#dadce0] bg-white px-4",
        "text-sm font-medium text-[#3c4043]",
        "shadow-sm transition-all duration-200",
        "hover:border-[#c6c9cc] hover:bg-[#f8f9fa] hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-70",
        className,
      ].join(" ")}
      aria-label="Continue with Google"
    >
      {loading ? (
        <>
          <Loader2 className="h-[18px] w-[18px] animate-spin text-gray-500" aria-hidden="true" />
          <span>Redirecting to Google…</span>
        </>
      ) : (
        <>
          <GoogleLogo className="h-[18px] w-[18px] shrink-0" />
          <span>Continue with Google</span>
        </>
      )}
    </motion.button>
  );
}
