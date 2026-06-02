"use client";

import { useState, FormEvent } from "react";
import { User, Mail, ArrowRight, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import BrandLogo from "@/components/BrandLogo";
import AuthFeatureList from "@/components/auth/AuthFeatureList";
import { InputFieldIcon } from "@/components/auth/AuthFormIcons";
import { Icon } from "@/components/ui/icon";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import OrDivider from "@/components/auth/OrDivider";
import PasswordFieldHints from "@/components/auth/PasswordFieldHints";
import { validateRegisterForm } from "@/lib/auth-validation";
import { useAuthFieldErrors } from "@/components/auth/useAuthFieldErrors";
import { useLanguage } from "@/components/i18n/LanguageProvider";
export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { fieldErrors, applyIssues, clearField, clearAll, messageFor } = useAuthFieldErrors();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    clearAll();

    if (!agreeTerms) {
      setError(t("auth.terms_required"));
      return;
    }

    const issues = validateRegisterForm({ name, email, password, confirmPassword });
    if (!applyIssues(issues)) {
      toast({
        title: t("auth.createAccount"),
        description: issues[0] ? messageFor(issues[0]) : t("auth.password_mismatch"),
        variant: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      const cleanEmail = email.toLowerCase().trim();
      const response = await fetch("/api/auth/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: cleanEmail,
          password,
          confirmPassword,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || t("auth.password_mismatch"));
        toast({
          title: t("auth.createAccount"),
          description: result.error || "Error",
          variant: "error",
        });
        return;
      }

      localStorage.setItem("pending_otp_email", cleanEmail);
      const devHint = result.devCode
        ? ` Dev kod: ${result.devCode}`
        : "";
      toast({
        title: t("auth.createAccount"),
        description:
          result.otpDelivery === "failed"
            ? t("auth.otp_failed") + devHint
            : t("auth.otp_sent") + devHint,
      });
      router.push(result.redirect || `/verify-otp?email=${encodeURIComponent(cleanEmail)}`);
    } catch {
      setError(t("auth.password_mismatch"));
      toast({ title: t("auth.createAccount"), description: "Error", variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (field: keyof typeof fieldErrors) =>
    `w-full pl-12 py-3.5 border rounded-xl text-base focus:outline-none focus:ring-2 transition ${
      fieldErrors[field]
        ? "border-red-400 focus:ring-red-200"
        : "border-gray-300 focus:ring-gray-300"
    }`;

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
            {t("auth.registerTitle1")} <br />
            <span className="text-gray-400">{t("auth.registerTitle2")}</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-md">{t("auth.registerSub")}</p>
          <AuthFeatureList items={[t("nav.getStarted"), "ATS", "PDF"]} />
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
            <h2 className="text-2xl font-semibold mb-2 text-center">{t("auth.createAccount")}</h2>
            <p className="text-sm text-gray-500 mb-6 text-center">{t("auth.registerForm")}</p>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="relative">
                  <InputFieldIcon icon={User} />
                  <input
                    type="text"
                    placeholder={t("auth.fullName")}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      clearField("name");
                    }}
                    className={inputClass("name")}
                  />
                </div>
                {fieldErrors.name && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
                )}
              </div>

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
                    className={inputClass("email")}
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
                    className={inputClass("password")}
                  />
                </div>
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
                )}
                <PasswordFieldHints password={password} className="mt-2" />
                <p className="mt-1 text-[11px] text-gray-400">{t("auth.passwordHint")}</p>
              </div>

              <div>
                <div className="relative">
                  <InputFieldIcon icon={Lock} />
                  <input
                    type="password"
                    placeholder={t("auth.confirmPassword")}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      clearField("confirmPassword");
                    }}
                    className={inputClass("confirmPassword")}
                  />
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p>
                )}
              </div>

              <div className="flex items-center gap-2 px-1 py-1">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-gray-500"
                />
                <label htmlFor="agreeTerms" className="text-sm text-gray-500 cursor-pointer">
                  {t("auth.agreeTerms")}
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white py-3.5 rounded-xl text-base font-medium flex items-center justify-center gap-2 hover:bg-gray-900 transition disabled:opacity-70"
              >
                {isLoading ? t("auth.creating") : t("auth.createAccount")}
                <Icon icon={ArrowRight} size="sm" />
              </button>
            </form>

            <OrDivider />
            <GoogleSignInButton callbackUrl="/dashboard" />

            <p className="text-sm text-gray-500 mt-6 text-center">
              {t("auth.haveAccount")}{" "}
              <Link href="/login" className="text-black font-medium hover:underline">
                {t("auth.signIn")}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
