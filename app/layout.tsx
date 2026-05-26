import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import UpgradeModal from "@/components/UpgradeModal";
import { AppProviders } from "@/app/providers";
import { inter } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "SmartCV.AZ",
  description: "AI-powered CV builder and resume analyzer",
  icons: {
    icon: [{ url: "/brand/logo-mark.svg", type: "image/svg+xml" }],
    apple: "/brand/logo-mark.svg",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="az" className={inter.variable}>
      <body className={inter.className}>
        <AppProviders>
          {children}
          <UpgradeModal />
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
