"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function OtpVerificationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const pendingEmail = localStorage.getItem('pending_otp_email');
    if (!pendingEmail) {
      router.replace('/register');
    }
  }, [router]);

  useEffect(() => {
  if (!canResend) {
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }
}, [canResend]);
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const pendingEmail = localStorage.getItem("pending_otp_email");
      if (!pendingEmail) throw new Error("No pending verification");

      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, otp }),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'OTP doğrulanmadı');
        toast({ title: 'OTP xətası', description: result.error || 'Doğrulamaya yenidən cəhd edin.' });
        return;
      }

      localStorage.removeItem('pending_otp_email');
      toast({ title: 'Təsdiq olundu', description: 'Dashboard-a yönləndirilirsiniz.' });
      router.push('/dashboard');
    } catch (err) {
      setError("Doğrulama zamanı xəta baş verdi");
      toast({ title: "OTP alınmadı" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4 text-center">OTP doğrulama</h2>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center border border-red-100"
          >
            {error}
          </motion.div>
        )}
        {/* Resend OTP Section */}
        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={async () => {
              const email = localStorage.getItem("pending_otp_email");
              if (!email) return;
              await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
              });
              toast({ title: 'Yeni OTP göndərildi' });
              setCanResend(false);
              setResendTimer(60);
            }}
            disabled={!canResend}
            className="text-sm text-blue-600 hover:underline disabled:opacity-50"
          >
            {canResend ? 'OTP yenidən göndər' : `Yenidən göndər (${resendTimer}s)`}
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              required
              placeholder="OTP kod"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full pl-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-900 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Doğrulanır..." : "Təsdiqlə"}
            <ArrowRight size={18} />
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-6 text-center">
          <a href="/login" className="text-black font-medium hover:underline">Hesaba Daxil Ol</a>
        </p>
      </div>
    </div>
  );
}
