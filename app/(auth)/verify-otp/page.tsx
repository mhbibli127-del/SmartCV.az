"use client";

import { useState, useEffect, useRef, FormEvent, Suspense } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/components/i18n/LanguageProvider";

function VerifyOtpContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [timer, setTimer] = useState(300); // 5 minutes
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  
  const inputRefs = useRef<HTMLInputElement[]>([]);

  // Redirect to login if email is missing
  useEffect(() => {
    if (!email) {
      router.push("/login");
    }
  }, [email, router]);

  // Focus the first input box on load
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Focus next box if current box is filled
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      // Focus previous box if backspacing an empty box
      if (!otp[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (pasteData.length === 6 && /^\d+$/.test(pasteData)) {
      const digits = pasteData.split("");
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      setError(t("auth.otpIncomplete"));
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: fullOtp }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(data.redirect || "/dashboard");
      } else {
        setError(data.error || "Kod təsdiq edilə bilmədi.");
      }
    } catch (err) {
      setError("Şəbəkə xətası baş verdi. Yenidən cəhd edin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    setError("");
    setMessage("");
    setOtp(new Array(6).fill(""));

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        const devPart =
          data.devCode != null
            ? ` Kod: ${data.devCode}`
            : data.devMode
              ? ` ${t("auth.otp_dev")}`
              : "";
        setMessage(
          data.devMode || data.devCode
            ? `${t("auth.otp_sent")}${devPart}`
            : t("auth.otp_sent")
        );
        setTimer(300);
        inputRefs.current[0]?.focus();
      } else {
        setError(data.error || "Kodu yenidən göndərmək mümkün olmadı.");
      }
    } catch (err) {
      setError("Şəbəkə xətası baş verdi.");
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
            {t("auth.verifyBanner1")} <br />
            <span className="text-gray-400">{t("auth.verifyBanner2")}</span> <br />
            {t("auth.verifyBanner3")}
          </h1>

          <p className="text-lg text-gray-600 max-w-md">{t("auth.verifyBannerSub")}</p>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span>{t("auth.secureLogin")}</span>
            <span>{t("auth.timerLimit")}</span>
            <span>{t("auth.fastCheck")}</span>
          </div>
        </motion.div>

        {/* Right Verification Card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center">
                <ShieldCheck size={26} />
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-center mb-1">{t("auth.verifyTitle")}</h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              {t("auth.verifySub")}: <strong>{email}</strong>
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center border border-red-100"
              >
                {error}
              </motion.div>
            )}

            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50 text-emerald-700 text-sm p-3 rounded-lg mb-4 text-center border border-emerald-100"
              >
                {message}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 6 OTP Digit Inputs */}
              <div className="flex justify-between gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    required
                    maxLength={1}
                    value={digit}
                    ref={(el) => {
                      if (el) inputRefs.current[idx] = el;
                    }}
                    onChange={(e) => handleChange(e.target.value, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    className="w-12 h-14 text-center text-xl font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 transition bg-[#fafafa]"
                  />
                ))}
              </div>

              {/* Timer status */}
              <div className="text-center text-sm text-gray-500">
                {timer > 0 ? (
                  <span>Kodun etibarlılıq müddəti: <strong className="text-black">{formatTime(timer)}</strong></span>
                ) : (
                  <span className="text-red-500 font-medium">Kodun müddəti bitdi</span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || otp.join("").length !== 6}
                className="w-full bg-black text-white py-3.5 rounded-xl text-base font-medium flex items-center justify-center gap-2 hover:bg-gray-900 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? t("auth.signingIn") : t("auth.verify")}
                <ArrowRight size={18} />
              </button>
            </form>

            {/* Resend Actions */}
            <div className="mt-6 flex flex-col items-center gap-2 text-sm text-gray-500">
              <span>{t("auth.resend")}?</span>
              <button
                onClick={handleResend}
                disabled={isLoading || timer > 240}
                className="text-black font-semibold hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
              >
                {timer > 240 ? `Yenidən göndər (${formatTime(timer - 240)})` : "Kodu yenidən göndər"}
              </button>
            </div>

            <p className="text-center text-xs text-gray-400 mt-6">
              Səhv email daxil etmisiniz?{" "}
              <Link href="/login" className="text-black hover:underline">
                Geri qayıt
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
          <div className="text-gray-500 font-medium">Yüklənir...</div>
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
