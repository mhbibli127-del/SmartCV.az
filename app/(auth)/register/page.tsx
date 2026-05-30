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

export default function RegisterPage() {
  const router = useRouter();
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

    if (!agreeTerms) {
      setError("İstifadə şərtləri ilə razılaşmalısınız.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Parollar uyğun deyil.");
      return;
    }

    setIsLoading(true);
    try {
      const cleanEmail = email.toLowerCase().trim();
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: cleanEmail, password }),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Qeydiyyat alınmadı');
        toast({ title: "Qeydiyyat xətası", description: result.error || "Qeydiyyatı tamamla" });
        return;
      }

      localStorage.setItem('pending_otp_email', cleanEmail);
      toast({
        title: "Qeydiyyat uğurlu",
        description:
          result.otpDelivery === "failed"
            ? "Hesab yaradıldı. OTP göndərilmədi — 'Yenidən göndər' düyməsindən istifadə edin."
            : "OTP göndərildi. Kodu daxil edin.",
      });
      router.push(result.redirect || '/verify-otp?email=' + encodeURIComponent(cleanEmail));
    } catch (err) {
      setError("Qeydiyyat zamanı xəta baş verdi.");
      toast({ title: "Qeydiyyat alınmadı", description: "Xahiş edirik yenidən cəhd edin." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-6">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <h1 className="text-5xl md:text-6xl font-semibold leading-tight tracking-tight">
            Yeni hesab yarat <br />
            və <span className="text-gray-400">CV-ni təkmilləşdir.</span>
          </h1>

          <p className="text-lg text-gray-600 max-w-md">
            Peşəkar şablonlar və Studio redaktoru ilə CV-nizi işə uyğun formata gətirin —
            ATS layout və PDF ixracı bir yerdə.
          </p>

          <AuthFeatureList
            items={["Sürətli qeydiyyat", "ATS layout", "PDF ixrac"]}
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
            <h2 className="text-2xl font-semibold mb-2 text-center">Hesab Yarat</h2>
            <p className="text-sm text-gray-500 mb-6 text-center">SmartCV.az-da qeydiyyatdan keçin</p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center border border-red-100"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <InputFieldIcon icon={User} />
                <input
                  type="text"
                  required
                  placeholder="Ad və Soyad"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 py-3.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
                />
              </div>

              <div className="relative">
                <InputFieldIcon icon={Mail} />
                <input
                  type="email"
                  required
                  placeholder="Email ünvanı"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 py-3.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
                />
              </div>

              <div className="relative">
                <InputFieldIcon icon={Lock} />
                <input
                  type="password"
                  required
                  placeholder="Parol"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 py-3.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
                />
              </div>

              <div className="relative">
                <InputFieldIcon icon={Lock} />
                <input
                  type="password"
                  required
                  placeholder="Parolu təsdiqlə"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 py-3.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
                />
              </div>

              <div className="flex items-center gap-2 px-1 py-1">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-gray-500"
                />
                <label htmlFor="agreeTerms" className="text-sm text-gray-500 cursor-pointer select-none">
                  <span className="hover:underline text-gray-700 font-medium">İstifadə şərtləri</span> ilə razıyam.
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white py-3.5 rounded-xl text-base font-medium flex items-center justify-center gap-2 hover:bg-gray-900 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating account…" : "Create account"}
                <Icon icon={ArrowRight} size="sm" />
              </button>
            </form>

            <OrDivider />

            <GoogleSignInButton callbackUrl="/dashboard" />

            <p className="text-sm text-gray-500 mt-6 text-center">
              Artıq hesabın var?{" "}
              <Link href="/login" className="text-black font-medium hover:underline">
                Daxil ol
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
