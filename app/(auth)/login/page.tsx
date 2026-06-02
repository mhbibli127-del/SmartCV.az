"use client";

import { useState, FormEvent, useEffect } from "react";
import { Mail, ArrowRight, Lock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Suspense } from "react";
import { useToast } from "@/components/ui/use-toast";
import BrandLogo from "@/components/BrandLogo";
import AuthFeatureList from "@/components/auth/AuthFeatureList";
import { InputFieldIcon } from "@/components/auth/AuthFormIcons";
import { Icon } from "@/components/ui/icon";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import OrDivider from "@/components/auth/OrDivider";
import { clearAuthVerificationState } from "@/lib/auth-verification-state";
import { resolveOAuthDestination } from "@/lib/auth-redirect-path";
import { validateLoginForm } from "@/lib/auth-validation";
import { useAuthFieldErrors } from "@/components/auth/useAuthFieldErrors";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import PasswordFieldHints from "@/components/auth/PasswordFieldHints";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  google:
    "Google redirect URI mismatch. In Google Console add the exact callback from /api/auth/config, and set Vercel NEXTAUTH_URL to your live https:// domain (not localhost).",
  OAuthSignin: "Could not start Google sign-in. Check your OAuth configuration.",
  OAuthCallback: "Google sign-in was interrupted. Please try again.",
  OAuthCreateAccount: "Could not create your account via Google.",
  OAuthAccountNotLinked:
    "This email is already registered with a password. Sign in with email instead.",
  AccessDenied: "Access was denied. Please try again.",
  Configuration: "Auth is misconfigured. Contact support or check server logs.",
  Default: "Google sign-in failed. Please try again.",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const { fieldErrors, applyIssues, clearField, clearAll, messageFor } = useAuthFieldErrors();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const rawCb = searchParams.get("callbackUrl");
    const oauthError = searchParams.get("error");
    if (rawCb?.includes("sync-session") || (rawCb && rawCb.length > 80)) {
      const q = oauthError ? `?error=${encodeURIComponent(oauthError)}` : "";
      router.replace(`/login${q}`);
      return;
    }

    const reason = searchParams.get("reason");
    if (reason === "session_expired") {
      toast({
        title: "Session expired",
        description: "Please sign in again.",
      });
    }

    if (oauthError) {
      const message =
        OAUTH_ERROR_MESSAGES[oauthError] ?? OAUTH_ERROR_MESSAGES.Default;
      setError(message);
      toast({
        title: "Google sign-in failed",
        description: message,
        variant: "error",
      });
      if (oauthError === "OAuthCallback") {
        void fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      }
      const rawCb = searchParams.get("callbackUrl");
    }
  }, [searchParams, toast, router]);

  const callbackUrl = resolveOAuthDestination(searchParams.get("callbackUrl"));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    clearAll();
    const issues = validateLoginForm({ email, password });
    if (!applyIssues(issues)) {
      toast({
        title: t("auth.signIn"),
        description: issues[0] ? messageFor(issues[0]) : t("auth.email_required"),
        variant: "error",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();

      if (!response.ok) {
        if (result?.unverified && result?.redirect) {
          toast({
            title: "Email not verified",
            description: "We sent a new verification code. Enter it to continue.",
          });
          router.push(result.redirect);
          return;
        }

        setError(result.error || "Sign-in failed.");
        toast({
          title: "Sign-in failed",
          description: result.error || "Invalid email or password.",
        });
        return;
      }

      toast({ title: "Signed in", description: "Redirecting to your dashboard…" });
      clearAuthVerificationState();
      const destination = result.redirect || callbackUrl || "/dashboard";
      window.location.assign(destination);
    } catch {
      setError("Something went wrong during sign-in.");
      toast({ title: "Sign-in error", description: "Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-6 py-8">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <h1 className="text-5xl md:text-6xl font-semibold leading-tight tracking-tight">
            {t("auth.loginTitle1")} <br />
            <span className="text-gray-400">{t("auth.loginTitle2")}</span> <br />
            {t("auth.loginTitle3")}
          </h1>

          <p className="text-lg text-gray-600 max-w-md">{t("auth.loginSub")}</p>

          <AuthFeatureList
            items={[
              t("nav.getStarted"),
              "ATS",
              "PDF",
            ]}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="flex justify-center mb-4">
              <BrandLogo variant="full" size="sm" />
            </div>
            <p className="text-sm text-gray-500 mb-6 text-center">{t("auth.loginForm")}</p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center border border-red-100"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <div className="relative">
                  <InputFieldIcon icon={Mail} />
                  <input
                    type="email"
                    placeholder={t("auth.email")}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearField("email");
                    }}
                    className={`w-full pl-12 py-4 border rounded-xl text-base focus:outline-none focus:ring-2 transition ${
                      fieldErrors.email
                        ? "border-red-400 focus:ring-red-200"
                        : "border-gray-300 focus:ring-gray-300"
                    }`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
                )}
              </div>
              <div>
                <div className="relative">
                  <InputFieldIcon icon={Lock} />
                  <input
                    type="password"
                    placeholder={t("auth.password")}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearField("password");
                    }}
                    className={`w-full pl-12 py-4 border rounded-xl text-base focus:outline-none focus:ring-2 transition ${
                      fieldErrors.password
                        ? "border-red-400 focus:ring-red-200"
                        : "border-gray-300 focus:ring-gray-300"
                    }`}
                  />
                </div>
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
                )}
                {password.length > 0 && <PasswordFieldHints password={password} className="mt-2" />}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white py-4 rounded-xl text-base font-medium flex items-center justify-center gap-2 hover:bg-gray-900 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? t("auth.signingIn") : t("auth.signIn")}
                <Icon icon={ArrowRight} size="sm" />
              </button>
            </form>

            <OrDivider />

            <GoogleSignInButton callbackUrl={callbackUrl} />

            <p className="text-sm text-gray-500 mt-6 text-center">
              {t("auth.noAccount")}{" "}
              <Link href="/register" className="text-black font-medium hover:underline">
                {t("auth.createAccount")}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
          <div className="text-gray-500 font-medium">Loading…</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
